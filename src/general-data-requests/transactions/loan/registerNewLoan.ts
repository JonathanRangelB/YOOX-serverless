import { Int, Table, VarChar, Transaction, Float, DateTime } from 'mssql';
import { loanHeader } from '../../../interfaces/loan-interface';
import { genericBDRequest } from '../../types/genericBDRequest';
import { indexes_id } from '../../../helpers/table-schemas';
import { StatusCodes } from '../../../helpers/statusCodes';
import { registerSnapshotRealInvestmentReport } from '../reporting/registerSnapshotRealInvestmentReport';

export const registerNewLoan = async (
  loan_header: loanHeader,
  procTransaction: Transaction
): Promise<genericBDRequest> => {
  try {
    const {
      id_cliente,
      id_plazo,
      id_usuario,
      cantidad_prestada,
      dia_semana,
      fecha_inicial,
      fecha_final_estimada,
      id_cobrador,
      cantidad_restante,
      cantidad_pagar,
      tasa_interes,
      id_grupo_original,
      semanas_plazo,
    } = loan_header;

    const nextIdQuery = await procTransaction
      .request()
      .query<indexes_id>(
        `SELECT [indice] FROM [INDICES] WHERE OBJETO IN ('ID_PRESTAMOS') ORDER BY OBJETO; `
      );

    const lastLoanId = nextIdQuery.recordset[0].indice;
    const tableLoanHeaderBD = new Table('PRESTAMOS');
    const tableLoanDetailBD = new Table('PRESTAMOS_DETALLE');

    tableLoanHeaderBD.create = false;
    tableLoanDetailBD.create = false;

    tableLoanHeaderBD.columns.add('ID', Int, { nullable: false });
    tableLoanHeaderBD.columns.add('ID_CLIENTE', Int, { nullable: false });
    tableLoanHeaderBD.columns.add('ID_PLAZO', Int, { nullable: false });
    tableLoanHeaderBD.columns.add('ID_USUARIO', Int, { nullable: false });
    tableLoanHeaderBD.columns.add('CANTIDAD_PRESTADA', Float, {
      nullable: false,
    });
    tableLoanHeaderBD.columns.add('DIA_SEMANA', VarChar, { nullable: false });
    tableLoanHeaderBD.columns.add('FECHA_INICIAL', DateTime, {
      nullable: false,
    });
    tableLoanHeaderBD.columns.add('FECHA_FINAL_ESTIMADA', DateTime, {
      nullable: false,
    });
    tableLoanHeaderBD.columns.add('FECHA_FINAL_REAL', DateTime, {
      nullable: false,
    });
    tableLoanHeaderBD.columns.add('ID_COBRADOR', Int, { nullable: false });
    tableLoanHeaderBD.columns.add('CANTIDAD_RESTANTE', Float, {
      nullable: true,
    });
    tableLoanHeaderBD.columns.add('CANTIDAD_PAGAR', Float, { nullable: true });
    tableLoanHeaderBD.columns.add('STATUS', VarChar, { nullable: true });
    tableLoanHeaderBD.columns.add('ID_CONCEPTO', Int, { nullable: true });
    tableLoanHeaderBD.columns.add('TASA_INTERES', Int, { nullable: true });
    tableLoanHeaderBD.columns.add('ID_GRUPO_ORIGINAL', Int, { nullable: true });

    tableLoanDetailBD.columns.add('ID_PRESTAMO', Int, { nullable: false });
    tableLoanDetailBD.columns.add('NUMERO_SEMANA', Int, { nullable: false });
    tableLoanDetailBD.columns.add('ID_USUARIO', Int, { nullable: false });
    tableLoanDetailBD.columns.add('FECHA_VENCIMIENTO', DateTime, {
      nullable: false,
    });
    tableLoanDetailBD.columns.add('STATUS', VarChar, { nullable: true });
    tableLoanDetailBD.columns.add('CANTIDAD', Float, { nullable: false });
    tableLoanDetailBD.columns.add('ID_COBRADOR', Int, { nullable: false });
    tableLoanDetailBD.columns.add('SALDO_PENDIENTE', Float, { nullable: true });
    tableLoanDetailBD.columns.add('MODO_INSERCION', VarChar, {
      nullable: true,
    });

    //Inicia llenado del encabezado del prestamo
    tableLoanHeaderBD.rows.add(
      lastLoanId,
      id_cliente,
      id_plazo,
      id_usuario,
      cantidad_prestada,
      dia_semana,
      fecha_inicial,
      fecha_final_estimada,
      fecha_final_estimada,
      id_cobrador,
      cantidad_restante,
      cantidad_pagar,
      'EMITIDO',
      1,
      tasa_interes,
      id_grupo_original
    );

    //Inicia llenado del detalle del prestamo

    const dateInUTC = new Date(fecha_inicial).getTime();
    const cantidad_semanal = cantidad_pagar / semanas_plazo;
    const msSemanaAdicional = 7 * 24 * 60 * 60 * 1000;

    for (let counter = 1; counter <= semanas_plazo; counter++) {
      const fechaDePago = new Date(dateInUTC + counter * msSemanaAdicional);

      tableLoanDetailBD.rows.add(
        lastLoanId,
        counter,
        id_usuario,
        fechaDePago.toISOString(),
        'NO PAGADO',
        cantidad_semanal,
        id_cobrador,
        cantidad_semanal,
        'SYSTEM'
      );
    }

    const bulkTableHeaderResult = await procTransaction
      .request()
      .bulk(tableLoanHeaderBD);
    const bulkTableDetailResult = await procTransaction
      .request()
      .bulk(tableLoanDetailBD);
    const updateIndexResult = await procTransaction
      .request()
      .query(
        `UPDATE [INDICES] SET [INDICE] = ${lastLoanId} + 1 WHERE OBJETO = 'ID_PRESTAMOS'`
      );

    const takeSnapshotResult = await registerSnapshotRealInvestmentReport(id_cliente, lastLoanId, procTransaction);

    if (
      !bulkTableHeaderResult.rowsAffected ||
      !bulkTableDetailResult.rowsAffected ||
      !updateIndexResult.rowsAffected[0] ||
      !takeSnapshotResult
    )
      return {
        message: 'Error durante la transacción de generación de préstamo',
        error: StatusCodes.BAD_REQUEST,
        generatedId: 0,
      };
    return {
      message: `Préstamo generado con folio ${lastLoanId}`,
      generatedId: lastLoanId,
    };
  } catch (exception) {
    return {
      message: (exception as Error).message,
      generatedId: 0,
      error: StatusCodes.BAD_REQUEST,
    };
  }
};
