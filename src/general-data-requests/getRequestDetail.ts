import { APIGatewayEvent } from 'aws-lambda';
import { DbConnector } from '../helpers/dbConnector';
import {
  DatosSolicitudDetalle,
  SolicitudDetalle,
} from './types/getRequest.interface';
import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { StatusCodes } from '../helpers/statusCodes';
import { requestDetailSearchQuery } from './utils/querySearchRequestDetail';
import { requestDetailSearchParametersSchema } from './schemas/request.schema';
import { validatePayload } from '../helpers/utils';

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return generateJsonResponse(
      { message: 'No body provided' },
      StatusCodes.BAD_REQUEST
    );
  }

  const body = JSON.parse(event.body);

  const { request_number } = body as DatosSolicitudDetalle;

  const validateSearchParameters = validatePayload(
    body,
    requestDetailSearchParametersSchema
  );

  if (!validateSearchParameters.valid) {
    return generateJsonResponse(
      {
        message: 'Object provided invalid',
        error: validateSearchParameters.error,
        additionalProperties: validateSearchParameters.additionalProperties,
      },
      StatusCodes.BAD_REQUEST
    );
  }

  try {
    const pool = await DbConnector.getInstance().connection;

    const queryStatement = requestDetailSearchQuery(request_number);

    const registrosEncontrados = await pool
      .request()
      .query<SolicitudDetalle>(queryStatement);

    if (!registrosEncontrados.rowsAffected[0])
      return generateJsonResponse(
        { message: 'Error 404', error: 'No se encontraron registros' },
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
