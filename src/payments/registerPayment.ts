import { Int, Date, Float } from 'mssql';
import { SPAltaPago } from './types/SPAltaPago';
import { statusResponse } from './types/pagos';
import { DbConnector } from '../helpers/dbConnector';

export const registerPayment = async (
  spaAltaPago: SPAltaPago
): Promise<statusResponse> => {
  let message = '';
  try {
    const pool = await DbConnector.getInstance().connection;
    const result = await pool
      .request()
      .input('ID_PRESTAMO', Int, spaAltaPago.ID_PRESTAMO)
      .input('ID_MULTA', Int, spaAltaPago.ID_MULTA)
      .input('NUMERO_SEMANA', Int, spaAltaPago.NUMERO_SEMANA)
      .input('ID_CLIENTE', Int, spaAltaPago.ID_CLIENTE)
      .input('ID_USUARIO', Int, spaAltaPago.ID_USUARIO)
      .input('CANTIDAD_PAGADA', Float, spaAltaPago.CANTIDAD_PAGADA)
      .input('FECHA_ACTUAL', Date, spaAltaPago.FECHA_ACTUAL)
      .input('ID_COBRADOR', Int, spaAltaPago.ID_COBRADOR)
      .execute('SP_ALTA_PAGO');

    if (result.returnValue != 0) throw new Error(result.returnValue);

    message = `Alta del pago para el folio ${spaAltaPago.ID_PRESTAMO} correspondiente a la semana ${spaAltaPago.NUMERO_SEMANA} de manera exitosa`;
    return { message };
  } catch (err) {
    if (err instanceof Error) {
      message =
        'Error al intentar registrar el pago. Posible pago adelantado no permitido.';
    }
    return { message, err: err as Error };
  }
};
