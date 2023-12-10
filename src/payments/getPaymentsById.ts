import { Pagos } from './types/pagos';

const sql = require('mssql');

export const getPaymentsById = async (folio: string) => {
  const sqlConfig = {
    user: process.env.USUARIO,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.SERVER,
    options: {
      // encrypt: true, // for azure
      trustServerCertificate: false, // change to true for local dev / self-signed certs
    },
  };

  try {
    // Asegúrate de que cualquier elemento esté correctamente codificado en la cadena de conexión URL
    await sql.connect(sqlConfig);
    return await sql.query`select * from PRESTAMOS_DETALLE where ID_PRESTAMO=${folio}`;
  } catch (err) {
    return { err };
  }
};
