import { StatusDePago } from './types/pagos';

import sql, { config } from 'mssql';
import { PrestamosDetalle } from './types/prestamos_detalle';
import { Prestamos } from './types/prestamos';

const sqlConfig: config = {
  user: process.env.USUARIO,
  password: process.env.PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.SERVER!,
  options: {
    enableArithAbort: true, // Importante para las transacciones
    abortTransactionOnError: true, // Importante para las transacciones
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

export const registerPayment = async (
  prestamosDetalle: PrestamosDetalle,
  prestamo: Prestamos
) => {
  // extraer solo los datos necesarios de la tabla PRESTAMOS_DETALLE
  const { ID_PRESTAMO, CANTIDAD, NUMERO_SEMANA } = prestamosDetalle;
  let { STATUS } = prestamo;

  // TODO: Validar que el prestamo no este pagado y crear una nueva interfaz con los status del prestamo (CANCELADO,REFINANCIADO,EMITIDO,PAGADO), porque ya hay status de pago para la tabla PRESTAMOS_DETALLE, esto para evitar hacer updates de prestamos y pagos que no sean necesarios
  if (STATUS !== 'EMITIDO') {
  }

  try {
    const pool = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      // Obtiene los datos actuales del prestamo
      const { recordset: prestamoActuales } = await sql.query(
        `select * from PRESTAMOS where ID=${ID_PRESTAMO};`
      );
      const { CANTIDAD_RESTANTE } = prestamoActuales[0];

      // Si la cantidad restante es menor o igual a 0, se marca como pagado en la tabla PRESTAMOS, caso contrario se mantiene el status actual del prestamo
      if (CANTIDAD_RESTANTE - CANTIDAD <= 0) {
        STATUS = StatusDePago.PAGADO;
      }

      await pool
        .request()
        .query(
          `update PRESTAMOS set CANTIDAD_RESTANTE = CANTIDAD_RESTANTE - ${CANTIDAD}, STATUS='${STATUS}' where ID=${ID_PRESTAMO};`
        );

      await pool
        .request()
        .query(
          `update PRESTAMOS_DETALLE set STATUS = '${StatusDePago.PAGADO}', SALDO_PENDIENTE = SALDO_PENDIENTE - ${CANTIDAD} where ID_PRESTAMO=${ID_PRESTAMO} and numero_semana=${NUMERO_SEMANA}`
        );

      // TODO: Agregar el registro de pagos a la tabla PAGOS
      // await pool.request()
      //   .query`insert (ID_PRESTAMO) into PAGOS values(${folio},${numero_semana},${id_cliente},${fecha},${id_usuario},${cantidad_pagada},${id_corte},${cancelado},${fecha_cancelado},${usuario_cancelo},${multa},${id_cobrador},${id_concepto},${hora_creacion},${datetime_stamp_server})`;
      await transaction.commit();
      console.log({ message: 'Transaction committed' });
      return { message: 'Transaction committed' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (err) {
    console.log('Transaction rolled back');
    return { err };
  }
};
