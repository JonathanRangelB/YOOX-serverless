import { APIGatewayEvent } from 'aws-lambda';
import { DbConnector } from '../helpers/dbConnector';
import { StatusCodes } from '../helpers/statusCodes';
import { generateGetJsonResponse } from '../helpers/generateGetJsonResponse';
import { loan_refinance } from '../helpers/table-schemas';
import { generateJsonResponse } from '../helpers/generateJsonResponse';

module.exports.handler = async (event: APIGatewayEvent) => {
  try {
    const customerid = event.queryStringParameters?.customerid;

    if (!customerid || isNaN(+customerid) || +customerid <= 0)
      throw new Error('Parametros incompletos');
    const pool = await DbConnector.getInstance().connection;
    const query = `
                select
                t0.id as id_prestamo,
                t0.id_cliente,
                t0.cantidad_restante

                from
                prestamos t0
                left join (
                    select
                    id_prestamo,
                    count(*) as num_de_pagos
                    
                    from prestamos_detalle pd 
                    
                    where
                    numero_semana between 1 and 10
                    and pd.status = 'PAGADO'
                    
                    group by id_prestamo
                ) t1 on t0.id = t1.id_prestamo

                where
                t0.status = 'EMITIDO'
                and t1.num_de_pagos = 10
                and t0.id_cliente = ${customerid} `;

    const result = await pool.query<loan_refinance>(query);

    if (result.recordset.length == 0)
      throw new Error('No se encontraron registros');

    return generateGetJsonResponse(result.recordsets[0], StatusCodes.OK);
  } catch (err) {
    if (err instanceof Error) {
      return generateJsonResponse(err.message, StatusCodes.BAD_REQUEST);
    }
  }
};
