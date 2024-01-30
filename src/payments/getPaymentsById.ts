const sql = require('mssql');

export const getPaymentsById = async (folio: string, id: string) => {
  const sqlConfig = {
    user: process.env.USUARIO,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.SERVER,
    options: {
      // encrypt: true, // for azure
      trustServerCertificate: true, // change to true for local dev / self-signed certs
    },
  };

  try {
    // Asegúrate de que cualquier elemento esté correctamente codificado en la cadena de conexión URL
    const pool = await sql.connect(sqlConfig);
    const prestamosQuery = pool
      .request()
      .query(
        `select P.*, C.NOMBRE as NOMBRE_CLIENTE from PRESTAMOS P inner join CLIENTES C on P.ID_CLIENTE = C.ID where P.ID=${folio} AND P.ID_COBRADOR=${id};`
      );
    const prestamosDetalleQuery = pool
      .request()
      .query(`select * from PRESTAMOS_DETALLE where ID_PRESTAMO=${folio};`);
    // colocar el tipo de dato que se espera en la respuesta, para prestamo colocar Prestamos y para prestamoDetalle PrestamosDetalle
    const [prestamo, prestamoDetalle] = await Promise.all([
      prestamosQuery,
      prestamosDetalleQuery,
    ]);
    await sql.close();
    return { prestamo, prestamoDetalle };
  } catch (err) {
    return { err };
  }
};
