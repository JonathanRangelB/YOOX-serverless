import { APIGatewayEvent } from 'aws-lambda';
import { DbConnector } from '../helpers/dbConnector';
import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { StatusCodes } from '../helpers/statusCodes';
import {
  DatosBusquedaCurp,
  ResultadoCurp,
} from './types/DatosBusqueda.interface';
import { isValidSearchCustomerParametersCurp } from './validateSearchParameters';
import { searchCurpQuery } from './utils/querySearchData';

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return generateJsonResponse(
      { message: 'No body provided' },
      StatusCodes.BAD_REQUEST
    );
  }

  const body = JSON.parse(event.body);
  const { curp, table } = body as DatosBusquedaCurp;
  const validateSearchParameters = isValidSearchCustomerParametersCurp(body);

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

    const queryStatement = searchCurpQuery(curp, table);

    // Asegúrate de que cualquier elemento esté correctamente codificado en la cadena de conexión URL
    const registrosEncontrados = await pool
      .request()
      .query<ResultadoCurp>(queryStatement);

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
