import { DbConnector } from '../helpers/dbConnector';
import { StatusCodes } from '../helpers/statusCodes';
import { Plazo } from './types/installments.type';
import { generateGetJsonResponse } from '../helpers/generateGetJsonResponse';
import { generateJsonResponse } from '../helpers/generateJsonResponse';

module.exports.handler = async () => {
  try {
    const pool = await DbConnector.getInstance().connection;
    const result = await pool.query<Plazo>(
      'SELECT ID, TASA_DE_INTERES, SEMANAS_PLAZO, SEMANAS_REFINANCIA FROM PLAZO'
    );
    if (result.recordset.length == 0)
      throw new Error('No se encontraron registros');

    return generateGetJsonResponse(result.recordset, StatusCodes.OK);
  } catch (err) {
    if (err instanceof Error) {
      return generateJsonResponse(err.message, StatusCodes.BAD_REQUEST);
    }
  }
};
