import { APIGatewayEvent } from 'aws-lambda';
import { DbConnector } from '../helpers/dbConnector';
import {
  DatosSolicitudPrestamoLista,
  SolicitudPrestamoLista,
} from './types/loanRequest';
import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { StatusCodes } from '../helpers/statusCodes';
import { loanRequestListSearchQuery } from './utils/querySearchLoanList';
import { isValidSearchLoanRequestListParameter } from './validateSearchLoanListParameter';

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return generateJsonResponse(
      { message: 'No body provided' },
      StatusCodes.BAD_REQUEST
    );
  }

  const body = JSON.parse(event.body);

  const { id_usuario, rol_usuario, offSetRows, fetchRowsNumber } = body as DatosSolicitudPrestamoLista;
  const validateSearchParameters = isValidSearchLoanRequestListParameter(body);

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
    const queryStatement = loanRequestListSearchQuery(id_usuario, rol_usuario, offSetRows, fetchRowsNumber);
    const registrosEncontrados = await pool
      .request()
      .query<SolicitudPrestamoLista>(queryStatement);

    if (!registrosEncontrados.rowsAffected[0])
      return generateJsonResponse(
        { message: 'Error 404', error: 'No se encontraron registros' },
        StatusCodes.NOT_FOUND
      );

    return generateJsonResponse(registrosEncontrados.recordset, StatusCodes.OK);
  } catch (error) {
    return generateJsonResponse({ error }, StatusCodes.BAD_REQUEST);
  }
};
