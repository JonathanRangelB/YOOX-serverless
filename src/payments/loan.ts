import { generateJsonResponse } from "../helpers/generateJsonResponse";
import { getPagosAdelantadosPermitidos } from "./getPagosAdelantadosPermitidos";
import { getPaymentsById as getLoanDetails } from "./getPaymentsById";
import { PrestamosDetalle } from "./types/pagos";
import { Prestamos } from "./types/prestamos";

module.exports.handler = async (event: any) => {
  const { id: folio } = event.pathParameters;
  const { idusuario } = JSON.parse(event.body);

  if (!idusuario || !folio) {
    return generateJsonResponse({ error: event.body }, 400);
  }

  const response = await getLoanDetails(folio, idusuario);
  const prestamos: Prestamos = response.prestamo.recordset[0];
  const prestamosDetalle: PrestamosDetalle[] =
    response.prestamoDetalle.recordsets[0];
  if (!prestamos || !prestamosDetalle)
    return generateJsonResponse(
      {
        message: `No se encontraron resultados para el prestamo solicitado: ${folio}`,
      },
      404
    );
  const pagosAdelantadosPermitidos: number | { err: unknown } =
    await getPagosAdelantadosPermitidos(prestamos.ID_CLIENTE);

  return generateJsonResponse(
    { prestamos, prestamosDetalle, pagosAdelantadosPermitidos },
    200
  );
};
