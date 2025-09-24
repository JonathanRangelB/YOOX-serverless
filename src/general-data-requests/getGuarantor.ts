import { APIGatewayEvent } from "aws-lambda";

import { DbConnector } from "../helpers/dbConnector";
import { generateGetJsonResponse } from "../helpers/generateGetJsonResponse";
import { generateJsonResponse } from "../helpers/generateJsonResponse";
import { StatusCodes } from "../helpers/statusCodes";
import { validatePayload } from "../helpers/utils";
import { guarantorSearchParametersSchema } from "./schemas/guarantor.schema";
import { AvalDomicilio, DatosAval } from "./types/getGuarantor.interface";
import { guarantorSearchQuery } from "./utils/querySearchGuarantor";

module.exports.handler = async (event: APIGatewayEvent) => {
  const params = event.queryStringParameters as DatosAval;

  if (!params)
    return generateJsonResponse(
      { message: "Error 400", error: "Params not provided." },
      StatusCodes.BAD_REQUEST
    );

  const validateSearchParameters = validatePayload(
    params,
    guarantorSearchParametersSchema
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

  const id = params.id ? +params.id : undefined;
  const curp = params.curp;
  const nombre = params.nombre;

  try {
    const pool = await DbConnector.getInstance().connection;

    const queryStatement = guarantorSearchQuery(id, curp, nombre);

    const registrosEncontrados = await pool
      .request()
      .query<AvalDomicilio>(queryStatement);

    if (!registrosEncontrados.rowsAffected[0])
      return generateJsonResponse(
        { message: "Error 404", error: "No se encontraron registros" },
        StatusCodes.NOT_FOUND
      );

    return generateGetJsonResponse(
      registrosEncontrados.recordset,
      StatusCodes.OK
    );
  } catch (error) {
    return generateJsonResponse({ error }, StatusCodes.BAD_REQUEST);
  }
};
