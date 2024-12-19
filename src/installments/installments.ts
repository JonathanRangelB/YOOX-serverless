import { DbConnector } from '../helpers/dbConnector';
import { StatusCodes } from '../helpers/statusCodes';
import { Plazo } from './types/installments.type';
import { generateGetJsonResponse } from '../helpers/generateGetJsonResponse';
import { generateJsonResponse } from '../helpers/generateJsonResponse';

module.exports.handler = async () => {
  try {
    const pool = await DbConnector.getInstance().connection;
    const result = await pool.query<Plazo>(
      'SELECT id, tasa_de_interes, semanas_plazo, semanas_refinancia FROM PLAZO'
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
