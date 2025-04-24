import { APIGatewayEvent } from 'aws-lambda';
import { DbConnector } from '../helpers/dbConnector';
import { StatusCodes } from '../helpers/statusCodes';
import { generateGetJsonResponse } from '../helpers/generateGetJsonResponse';
import { LoanRefinance } from '../helpers/table-schemas';
import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { querySearchLoanToRefinance } from './utils/querySearchLoanToRefinance';

module.exports.handler = async (event: APIGatewayEvent) => {
  try {
    const customerid = event.queryStringParameters?.customerid;

    if (!customerid || isNaN(+customerid) || +customerid <= 0)
      throw new Error('Parametros incompletos');
    const pool = await DbConnector.getInstance().connection;
    const query = `${querySearchLoanToRefinance('t0.id as id_prestamo, t0.id_cliente, t0.cantidad_restante')}  where t0.id_cliente = ${customerid} `;

    const result = await pool.query<LoanRefinance>(query);

    if (result.recordset.length == 0)
      throw new Error('No se encontraron registros');

    return generateGetJsonResponse(result.recordsets[0], StatusCodes.OK);
  } catch (err) {
    if (err instanceof Error) {
      return generateJsonResponse(err.message, StatusCodes.BAD_REQUEST);
    }
  }
};
