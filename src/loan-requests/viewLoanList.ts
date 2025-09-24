import { APIGatewayEvent } from "aws-lambda";
import { DbConnector } from "../helpers/dbConnector";
import {
  DatosSolicitudPrestamoLista,
  SolicitudPrestamoLista,
} from "./types/loanRequest";
import { generateJsonResponse } from "../helpers/generateJsonResponse";
import { StatusCodes } from "../helpers/statusCodes";
import {
  getGroupUsers,
  loanRequestListSearchQuery,
} from "./utils/querySearchLoanList";
import { validatePayload } from "../helpers/utils";
import { loanRequestListSearchParametersSchema } from "./schemas/loanList.schema";

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return generateJsonResponse(
      { message: "No body provided" },
      StatusCodes.BAD_REQUEST
    );
  }

  const body = JSON.parse(event.body) as DatosSolicitudPrestamoLista;

  const validateSearchParameters = validatePayload(
    body,
    loanRequestListSearchParametersSchema
  );

  if (!validateSearchParameters.valid) {
    return generateJsonResponse(
      {
        message: "Object provided invalid",
        error: validateSearchParameters.error,
        additionalProperties: validateSearchParameters.additionalProperties,
      },
      StatusCodes.BAD_REQUEST
    );
  }

  try {
    const pool = await DbConnector.getInstance().connection;
    const queryStatement = loanRequestListSearchQuery(body);
    const groupUsers = getGroupUsers(body.id_usuario, body.rol_usuario);
    const registrosEncontrados = await pool
      .request()
      .query<SolicitudPrestamoLista>(queryStatement);
    const foundGroupUsers = await pool.request().query(groupUsers);

    if (!registrosEncontrados.rowsAffected[0])
      return generateJsonResponse(
        { message: "Error 404", error: "No se encontraron registros" },
        StatusCodes.NOT_FOUND
      );
    return generateJsonResponse(
      {
        loanRequests: registrosEncontrados.recordset,
        usersList: foundGroupUsers.recordset,
      },
      StatusCodes.OK
    );
  } catch (error) {
    return generateJsonResponse({ error }, StatusCodes.BAD_REQUEST);
  }
};
