import { APIGatewayEvent } from 'aws-lambda';
import { DbConnector } from '../helpers/dbConnector';
import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { StatusCodes } from '../helpers/statusCodes';
import {
  DatosBusquedaTelefono,
  ResultadoTelefono,
} from './types/DatosBusqueda.interface';
import { isValidSearchCustomerParametersTelefono } from './validateSearchParameters';
import { searchTelefonoQuery } from './utils/querySearchData';

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return generateJsonResponse(
      { message: 'No body provided' },
      StatusCodes.BAD_REQUEST
    );
  }

  const body = JSON.parse(event.body);
  const { telefono_fijo, telefono_movil, table } =
    body as DatosBusquedaTelefono;
  const validateSearchParameters =
    isValidSearchCustomerParametersTelefono(body);

  if (!validateSearchParameters.valid) {
    return generateJsonResponse(
      {
        message: 'Object provided invalid',
        error: validateSearchParameters.error,
      },
      StatusCodes.BAD_REQUEST
    );
  }

  try {
    const pool = await DbConnector.getInstance().connection;

    const queryStatement = searchTelefonoQuery(
      telefono_fijo,
      telefono_movil,
      table
    );

    const registrosEncontrados = await pool
      .request()
      .query<ResultadoTelefono>(queryStatement);

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
