import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { getPaymentsById as getLoanDetails } from './getPaymentsById';
import { PrestamosDetalle } from './types/pagos';
import { Prestamos } from './types/prestamos';

module.exports.handler = async (event: any) => {
  const { id: folio } = event.pathParameters;
  const { idusuario } = event.headers;
  const response = await getLoanDetails(folio, idusuario);
  const prestamos: Prestamos = response.prestamo.recordset[0];
  const prestamosDetalle: PrestamosDetalle[] =
    response.prestamoDetalle.recordsets[0];

  return generateJsonResponse({ prestamos, prestamosDetalle }, 200);
};
