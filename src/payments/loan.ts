import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { getPaymentsById } from './getPaymentsById';
import { Pagos } from './types/pagos';
import { Prestamos } from './types/prestamos';

module.exports.handler = async (event: any) => {
  const { id: folio } = event.pathParameters;
  const { idusuario } = event.headers;
  const { recordsets } = await getPaymentsById(folio, idusuario);
  const pagos: Pagos[] = recordsets[0];
  const prestamo: Prestamos[] = recordsets[1];

  return generateJsonResponse({ prestamo: prestamo[0], pagos }, 200);
};
