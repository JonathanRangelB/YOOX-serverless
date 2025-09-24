import { APIGatewayEvent } from "aws-lambda";
import { DbConnector } from "../helpers/dbConnector";
import { generateJsonResponse } from "../helpers/generateJsonResponse";
import { StatusCodes } from "../helpers/statusCodes";
import {
  DatosBusquedaTelefono,
  ResultadoTelefono,
} from "./types/DatosBusqueda.interface";
import { searchTelefonoQuery } from "./utils/querySearchData";
import { validatePayload } from "../helpers/utils";
import { customerSearchTelefonoSchema } from "./schemas/personaTelefono.schema";

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return generateJsonResponse(
      { message: "No body provided" },
      StatusCodes.BAD_REQUEST
    );
  }

  const body = JSON.parse(event.body);
  const { telefono_fijo, telefono_movil, table, id_persona } =
    body as DatosBusquedaTelefono;
  const validateSearchParameters = validatePayload(
    body,
    customerSearchTelefonoSchema
  );

  if (!validateSearchParameters.valid) {
    return generateJsonResponse(
      {
        message: "Object provided invalid",
        error: validateSearchParameters.error,
      },
      StatusCodes.BAD_REQUEST
    );
  }

  try {
    const pool = await DbConnector.getInstance().connection;

    const whereFilterMap: Record<string, string> = {
      CLIENTES: ` AND ID <> ${id_persona} `,
      AVALES: ` AND ID_AVAL <> ${id_persona} `,
    };

    const whereFilter = (id_persona && whereFilterMap[table]) || "";

    let queryStatement = searchTelefonoQuery(
      telefono_fijo,
      telefono_movil,
      table
    );

    queryStatement += whereFilter;

    const registrosEncontrados = await pool
      .request()
      .query<ResultadoTelefono>(queryStatement);

    if (!registrosEncontrados.rowsAffected[0])
      return generateJsonResponse(
        { message: "Error 404", error: "No se encontraron registros" },
        StatusCodes.NOT_FOUND
      );

    return generateJsonResponse(
      registrosEncontrados.recordset[0],
      StatusCodes.OK
    );
  } catch (error) {
    return generateJsonResponse({ error }, StatusCodes.BAD_REQUEST);
  }
};
