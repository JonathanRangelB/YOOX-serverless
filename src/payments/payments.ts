import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { getPaymentsById } from './getPaymentsById';
import { Pagos } from './types/pagos';

module.exports.handler = async (event: any) => {
  const { id } = event.pathParameters;
  const { recordset } = await getPaymentsById(id);
  const pagos: Pagos[] = recordset;
  console.log({ pagos });

  return generateJsonResponse(pagos, 200);
};
