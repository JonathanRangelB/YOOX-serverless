import { StatusDePago } from './types/pagos';

import sql, { config } from 'mssql';
import { PrestamosDetalle } from './types/prestamos_detalle';
import { Prestamos } from './types/prestamos';
import { log } from 'console';

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

  try {
    const pool = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      // Obtiene los datos actuales del prestamo
      const { recordset: prestamoDetalleActuales } = await sql.query(
        `select * from PRESTAMOS_DETALLE where ID_PRESTAMO=${ID_PRESTAMO};`
      );
      const { recordset: prestamoActuales } = await sql.query(
        `select * from PRESTAMOS where ID=${ID_PRESTAMO};`
      );

      const { CANTIDAD_RESTANTE } = prestamoActuales[0];
      console.log({ CANTIDAD_RESTANTE, CANTIDAD, STATUS });

      if (CANTIDAD_RESTANTE - CANTIDAD <= 0) {
        STATUS = StatusDePago.PAGADO;
      }

      const algo = `update PRESTAMOS set CANTIDAD_RESTANTE = CANTIDAD_RESTANTE - ${CANTIDAD}, STATUS='${STATUS}' where ID=${ID_PRESTAMO};`;

      log(algo);

      await pool.request().query(algo);

      await pool
        .request()
        .query(
          `update PRESTAMOS_DETALLE set STATUS = '${StatusDePago.PAGADO}', SALDO_PENDIENTE = SALDO_PENDIENTE - ${CANTIDAD} where ID_PRESTAMO=${ID_PRESTAMO} and numero_semana=${NUMERO_SEMANA}`
        );

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
