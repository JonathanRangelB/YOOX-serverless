import { APIGatewayEvent } from 'aws-lambda';
import { DbConnector } from '../helpers/dbConnector';
import { AvalDomicilio, DatosAval } from './types/getGuarantor.interface';
import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { StatusCodes } from '../helpers/statusCodes';
import { guarantorSearchQuery } from './utils/querySearchGuarantor';
import { validatePayload } from '../helpers/utils';
import { guarantorSearchParametersSchema } from './schemas/guarantor.schema';

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return generateJsonResponse(
      { message: 'No body provided' },
      StatusCodes.BAD_REQUEST
    );
  }

  const body = JSON.parse(event.body);

  const { id, curp, nombre } = body as DatosAval;

  const validateSearchParameters = validatePayload(
    body,
    guarantorSearchParametersSchema
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

    const queryStatement = guarantorSearchQuery(id, curp, nombre);

    // Asegúrate de que cualquier elemento esté correctamente codificado en la cadena de conexión URL
    const registrosEncontrados = await pool
      .request()
      .query<AvalDomicilio>(queryStatement);

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
