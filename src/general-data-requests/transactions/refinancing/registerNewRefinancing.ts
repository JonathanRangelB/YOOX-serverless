import { refinance } from '../../../helpers/table-schemas';
import { Int, Table, Transaction, Float, DateTime } from 'mssql';
import { loanHeader } from '../../../interfaces/loan-interface';
import { genericBDRequest } from '../../types/genericBDRequest';
import { StatusCodes } from '../../../helpers/statusCodes';
import { querySearchLoanToRefinance } from '../../utils/querySearchLoanToRefinance';
import { registerNewLoan } from '../loan/registerNewLoan';
import { registerSnapshotRealInvestmentReport } from '../reporting/registerSnapshotRealInvestmentReport';

export const registerNewRefinancing = async (
  new_loan_header: loanHeader,
  refinance: refinance,
  procTransaction: Transaction
): Promise<genericBDRequest> => {
  try {
    const {
      fecha: local_date,
      id_usuario,
      id_cliente,
      id_prestamo_actual,
    } = refinance;

    const { cantidad_prestada } = new_loan_header;

    const queryCheckIfValid = `${querySearchLoanToRefinance('t0.id as id_prestamo, t0.id_cliente, t0.cantidad_restante')} where t0.id_cliente = ${id_cliente} and t0.id = ${id_prestamo_actual} `;

    const checkIfValid = await procTransaction
      .request()
      .query(queryCheckIfValid);

    if (!checkIfValid.rowsAffected[0]) {
      return {
        message: `El préstamo no puede ser refinanciado`,
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST,
      };
    }

    const cantidad_refinanciada = checkIfValid.recordset[0].cantidad_restante;

    if (
      cantidad_prestada < 1000.0 ||
      cantidad_prestada < cantidad_refinanciada
    ) {
      return {
        message: `No se puede refinanciar por una cantidad menor a la cantidad pendiente por pagar`,
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST,
      };
    }

    const nextIdQuery = await procTransaction.request().query(
      `SELECT 
                [indice]
                FROM INDICES 
                WHERE OBJETO = 'ID_REFINANCIAMIENTO'; `
    );

    const lastRefinanceId = nextIdQuery.recordset[0].indice;
    const idLoanNew = (await registerNewLoan(new_loan_header, procTransaction))
      .generatedId;

    if (!idLoanNew) {
      return {
        message: `Error al generar nuevo préstamo para refinanciamiento`,
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST,
      };
    }

    const tableRefinanciamiento = new Table('REFINANCIA');
    tableRefinanciamiento.create = false;

    tableRefinanciamiento.columns.add('ID', Int, { nullable: false });
    tableRefinanciamiento.columns.add('FECHA', DateTime, { nullable: false });
    tableRefinanciamiento.columns.add('ID_USUARIO', Int, { nullable: false });
    tableRefinanciamiento.columns.add('ID_CLIENTE', Int, { nullable: false });
    tableRefinanciamiento.columns.add('ID_PRESTAMO_ANT', Int, {
      nullable: false,
    });
    tableRefinanciamiento.columns.add('ID_PRESTAMO_ACT', Int, {
      nullable: false,
    });
    tableRefinanciamiento.columns.add('CANTIDAD', Float, { nullable: false });

    tableRefinanciamiento.rows.add(
      lastRefinanceId,
      local_date.toISOString(),
      id_usuario,
      id_cliente,
      id_prestamo_actual,
      idLoanNew,
      cantidad_refinanciada
    );

    const bulkTableRefinanceResult = await procTransaction
      .request()
      .bulk(tableRefinanciamiento);

    const updateIndexes = await procTransaction.request().query(
      `UPDATE DBO.INDICES SET INDICE = ${lastRefinanceId} + 1
                WHERE [OBJETO] =  'ID_REFINANCIAMIENTO'
                
            UPDATE PRESTAMOS_DETALLE SET STATUS = 'REFINANCIADO', SALDO_PENDIENTE=0.00
                WHERE STATUS = 'NO PAGADO' AND ID_PRESTAMO = ${id_prestamo_actual}

            UPDATE PRESTAMOS SET CANTIDAD_RESTANTE = 0.00, STATUS = 'REFINANCIADO' 
                WHERE STATUS = 'EMITIDO' AND ID = ${id_prestamo_actual}
            `
    );

    const takeSnapshotResult = await registerSnapshotRealInvestmentReport(
      id_cliente as number,
      idLoanNew,
      procTransaction
    );

    if (
      !bulkTableRefinanceResult.rowsAffected ||
      !updateIndexes.rowsAffected[0] ||
      !takeSnapshotResult.generatedId
    ) {
      return {
        message: 'Error durante la transacción',
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST,
      };
    }

    return {
      message: 'Refinanciamiento generado',
      generatedId: idLoanNew,
      error: StatusCodes.OK,
    };
  } catch (exception) {
    return {
      message: (exception as Error).message,
      generatedId: 0,
      error: StatusCodes.BAD_REQUEST,
    };
  }
};
