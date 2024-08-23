import sql, { config } from 'mssql';
import { SPAltaPago } from './types/SPAltaPago';

const sqlConfig: config = {
  user: process.env.USUARIO,
  password: process.env.PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.SERVER!,
  options: {
    // enableArithAbort: true, // Importante para las transacciones
    // abortTransactionOnError: true, // Importante para las transacciones
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

export const registerPayment = async (spaAltaPago: SPAltaPago) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input('ID_PRESTAMO', sql.Int, spaAltaPago.ID_PRESTAMO)
      .input('ID_MULTA', sql.Int, spaAltaPago.ID_MULTA)
      .input('NUMERO_SEMANA', sql.Int, spaAltaPago.NUMERO_SEMANA)
      .input('ID_CLIENTE', sql.Int, spaAltaPago.ID_CLIENTE)
      .input('ID_USUARIO', sql.Int, spaAltaPago.ID_USUARIO)
      .input('CANTIDAD_PAGADA', sql.Int, spaAltaPago.CANTIDAD_PAGADA)
      .input('FECHA_ACTUAL', sql.Date, spaAltaPago.FECHA_ACTUAL)
      .input('ID_COBRADOR', sql.Int, spaAltaPago.ID_COBRADOR)
      .execute('SP_ALTA_PAGO');

    await pool.close();

    if (result.returnValue != 0) throw new Error(result.returnValue);

    console.log(
      `Alta del pago para el folio ${spaAltaPago.ID_PRESTAMO} correspondiente a la semana ${spaAltaPago.NUMERO_SEMANA} de manera exitosa`
    );
    return `Alta del pago para el folio ${spaAltaPago.ID_PRESTAMO} correspondiente a la semana ${spaAltaPago.NUMERO_SEMANA} de manera exitosa`;
  } catch (err) {
    let message = '';
    if (err instanceof Error && err.message === '-1') {
      message =
        'Error al intentar registrar el pago. Codigo de error: ' + err.message;
      console.log(message);
    }
    if (err instanceof Error && err.message === '-2') {
      message =
        'Error al intentar registrar el pago. Timeout. Codigo de error: ' +
        err.message;
      console.log(message);
    }
    if (err instanceof Error && err.message === '-6') {
      message =
        'Error al intentar registrar el pago. Posibles parametros inválidos. Codigo de error: ' +
        err.message;
      console.log(message);
    } else {
      message = 'Error al intentar registrar el pago. Error: ' + err;
      console.log(message);
    }

    return { message };
  }
};
