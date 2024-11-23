import { APIGatewayEvent } from 'aws-lambda';
import { DbConnector } from '../helpers/dbConnector';
import { ClienteDomicilio, DatosCliente } from './types/getCustomer.interface';
import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { StatusCodes } from '../helpers/statusCodes';
import { customerSearchQuery } from './utils/querySearchCustomer';
import { isValidSearchCustomerParameters } from './validateSearchCustomerParameters';

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return generateJsonResponse(
      { message: 'No body provided' },
      StatusCodes.BAD_REQUEST
    );
  }

  const body = JSON.parse(event.body);

  const { id, curp, nombre, id_agente } = body as DatosCliente;
  const validateSearchParameters = isValidSearchCustomerParameters(body);

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

    const queryStatement = customerSearchQuery(id_agente, id, curp, nombre);

    // Asegúrate de que cualquier elemento esté correctamente codificado en la cadena de conexión URL
    const registrosEncontrados = await pool
      .request()
      .query<ClienteDomicilio>(queryStatement);

    if (!registrosEncontrados.rowsAffected[0])
      return generateJsonResponse(
        { message: 'Error 404', error: 'No se encontraron registros' },
        StatusCodes.NOT_FOUND
      );

    return generateJsonResponse(
      { registrosEncontrados: registrosEncontrados.recordset },
      StatusCodes.OK
    );
  } catch (error) {
    return generateJsonResponse({ error }, StatusCodes.BAD_REQUEST);
  }
};
