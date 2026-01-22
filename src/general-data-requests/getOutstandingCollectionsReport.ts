import { APIGatewayEvent } from "aws-lambda";
import { DbConnector } from "../helpers/dbConnector";
import { StatusCodes } from "../helpers/statusCodes";
import { generateGetJsonResponse } from "../helpers/generateGetJsonResponse";
import { generateJsonResponse } from "../helpers/generateJsonResponse";
import { validatePayload } from "../helpers/utils";
import { outstandingCollectionSchema } from "./schemas/outstanding-collection.schema";
import {
  requestAgenda,
  DatosAgenda,
} from "./types/getOutstandingCollections.interface";
import { outstandingCollectionsQuery } from "./reports/outstanding-collection-report/outstandingCollectionsReportQuery";
import {
  getGroupsListOfUser,
  getGroupUsers,
  getManagementListOfUser,
} from "../loan-requests/utils/querySearchLoanList";

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return generateJsonResponse(
      { message: "No body provided" },
      StatusCodes.BAD_REQUEST
    );
  }

  const body = JSON.parse(event.body);

  const validateOutstandingCollections = validatePayload(
    body,
    outstandingCollectionSchema
  );

  if (!validateOutstandingCollections.valid) {
    return generateJsonResponse(
      {
        message: "Object provided invalid",
        error: validateOutstandingCollections.error,
        additionalProperties:
          validateOutstandingCollections.additionalProperties,
      },
      StatusCodes.BAD_REQUEST
    );
  }

  const {
    id_usuario,
    rol_usuario,
    userIdFilter,
    groupIdFilter,
    managementIdFilter,
  } = body as requestAgenda;

  try {
    const pool = await DbConnector.getInstance().connection;
    const queryStatement = outstandingCollectionsQuery(
      id_usuario,
      rol_usuario,
      userIdFilter,
      groupIdFilter,
      managementIdFilter
    );

    const registrosEncontrados = await pool
      .request()
      .query<DatosAgenda>(queryStatement);

    if (!registrosEncontrados.rowsAffected[0]) {
      return generateGetJsonResponse(
        { message: "Error 404", error: "No se encontraron registros" },
        StatusCodes.NOT_FOUND
      );
    }

    const groupUsers = getGroupUsers(body.id_usuario, body.rol_usuario);
    const groupList = getGroupsListOfUser(body.id_usuario, body.rol_usuario);
    const managementList = getManagementListOfUser(
      body.id_usuario,
      body.rol_usuario
    );

    const foundGroupUsers = await pool.request().query(groupUsers);
    const listaDeGruposEncontrados = await pool.request().query(groupList);
    const listaDeGerenciasEncontradas = await pool
      .request()
      .query(managementList);

    return generateJsonResponse(
      {
        datosAgenda: registrosEncontrados.recordset,
        usersList: foundGroupUsers.recordset,
        groups: listaDeGruposEncontrados.recordset,
        management: listaDeGerenciasEncontradas.recordset,
      },
      StatusCodes.OK
    );
  } catch (err) {
    if (err instanceof Error) {
      return generateJsonResponse(err.message, StatusCodes.NOT_FOUND);
    }
  }
};
