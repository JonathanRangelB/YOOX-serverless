import { DbConnector } from "../helpers/dbConnector";

export const getPaymentsById = async (folio: string, id: string) => {
  try {
    const pool = await DbConnector.getInstance().connection;
    // Asegúrate de que cualquier elemento esté correctamente codificado en la cadena de conexión URL
    const prestamosQuery = pool
      .request()
      .query(
        `select P.*, C.NOMBRE as NOMBRE_CLIENTE from PRESTAMOS P inner join CLIENTES C on P.ID_CLIENTE = C.ID where P.ID=${folio} AND P.ID_COBRADOR=${id};`
      );
    const prestamosDetalleQuery = pool
      .request()
      .query(
        `select * from PRESTAMOS_DETALLE where ID_PRESTAMO=${folio} ORDER BY NUMERO_SEMANA ASC;`
      );
    // colocar el tipo de dato que se espera en la respuesta, para prestamo colocar Prestamos y para prestamoDetalle PrestamosDetalle
    const [prestamo, prestamoDetalle] = await Promise.all([
      prestamosQuery,
      prestamosDetalleQuery,
    ]);
    return { prestamo, prestamoDetalle };
  } catch (err) {
    return { err };
  }
};
