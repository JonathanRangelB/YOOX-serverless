import { Float, Int, Date as SQlDate } from 'mssql';

import { DbConnector } from '../helpers/dbConnector';
import { enqueueWhatsappMessage } from '../helpers/sqs';
import { SPAltaPago } from './types/SPAltaPago';
import { StatusResponse } from './types/pagos';

export const registerPayment = async (
  spaAltaPago: SPAltaPago
): Promise<StatusResponse> => {
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
      .input('FECHA_ACTUAL', SQlDate, spaAltaPago.FECHA_ACTUAL)
      .input('ID_COBRADOR', Int, spaAltaPago.ID_COBRADOR)
      .execute('SP_ALTA_PAGO');

    if (result.returnValue != 0) throw new Error(result.returnValue);

    message = `Alta del pago para el folio ${spaAltaPago.ID_PRESTAMO} correspondiente a la semana ${spaAltaPago.NUMERO_SEMANA} de manera exitosa`;

    await enqueueWhatsappMessage({
      messageType: 'text',
      // TODO: generar un mecanismo para obtener el numero de telefono del cliente
      to: '3315757197',
      body: message,
    });

    return { message };
  } catch (err) {
    if (err instanceof Error) {
      message =
        'Error al intentar registrar el pago. Posible pago adelantado no permitido.';
    }
    return { message, err: err as Error };
  }
};
