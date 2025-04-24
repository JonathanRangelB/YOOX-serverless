import { APIGatewayEvent } from 'aws-lambda';
import { DbConnector } from '../helpers/dbConnector';
import { StatusCodes } from '../helpers/statusCodes';
import { generateGetJsonResponse } from '../helpers/generateGetJsonResponse';
import { Address } from '../helpers/table-schemas';
import { generateJsonResponse } from '../helpers/generateJsonResponse';

module.exports.handler = async (event: APIGatewayEvent) => {
  try {
    const addressid = event.queryStringParameters?.addressid;
    if (!addressid || isNaN(+addressid) || +addressid <= 0)
      throw new Error('Parametros incompletos');
    const pool = await DbConnector.getInstance().connection;
    const query = `
            select
            t0.id, 
            t0.tipo_calle, 
            t0.nombre_calle, 
            t0.numero_exterior,
            t1.numero_interior,
            t0.colonia, 
            t0.municipio, 
            t0.estado, 
            t0.cp, 
            t0.referencias,
            t0.created_by_usr, 
            t0.created_date, 
            t0.modified_by_usr, 
            t0.modified_date

            from domicilios t0
            left join domicilios_num_interior t1 on t0.id  = t1.id_domicilio

            where
            t0.id = '${addressid}'`;

    const result = await pool.query<Address>(query);

    if (result.recordset.length == 0)
      throw new Error('No se encontraron registros');

    return generateGetJsonResponse(result.recordset[0], StatusCodes.OK);
  } catch (err) {
    if (err instanceof Error) {
      return generateJsonResponse(err.message, StatusCodes.NOT_FOUND);
    }
  }
};
