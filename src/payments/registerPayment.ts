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

export const registerPayment = async (
  spaAltaPago: SPAltaPago
): Promise<{ message: string; err?: Error }> => {
  let message = '';
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
    console.log(result);

    message = `Alta del pago para el folio ${spaAltaPago.ID_PRESTAMO} correspondiente a la semana ${spaAltaPago.NUMERO_SEMANA} de manera exitosa`;
    console.log(message);
    return { message };
  } catch (err) {
    if (err instanceof Error && err.message === '-1') {
      message = 'Error al intentar registrar el pago.';
    }
    if (err instanceof Error && err.message === '-2') {
      message = 'Error al intentar registrar el pago. Timeout.';
    }
    if (err instanceof Error && err.message === '-6') {
      message =
        'Error al intentar registrar el pago. Posibles parametros inválidos.';
    } else {
      message =
        'Error al registrar pago. Posiblemente es un pago adelantado no permitido.';
    }

    console.log({ message, err });
    return { message, err: err as Error };
  }
};
