import { APIGatewayEvent } from 'aws-lambda';
import { DbConnector } from '../helpers/dbConnector';
import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { StatusCodes } from '../helpers/statusCodes';
import {
  DatosBusquedaCurp,
  ResultadoCurp,
} from './types/DatosBusqueda.interface';
import { searchCurpQuery } from './utils/querySearchData';
import { validatePayload } from '../helpers/utils';
import { customerSearchCURPSchema } from './schemas/personaCURP.schema';

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return generateJsonResponse(
      { message: 'No body provided' },
      StatusCodes.BAD_REQUEST
    );
  }

  const body = JSON.parse(event.body);
  const { curp, table, id_persona } = body as DatosBusquedaCurp;
  const validateSearchParameters = validatePayload(
    body,
    customerSearchCURPSchema
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

    const whereFilterMap: Record<string, string> = {
      CLIENTES: ` AND ID <> ${id_persona} `,
      AVALES: ` AND ID_AVAL <> ${id_persona} `,
    };

    const whereFilter = (id_persona && whereFilterMap[table]) || '';

    let queryStatement = searchCurpQuery(curp, table);

    queryStatement += whereFilter;

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
