import { Refinance } from '../../../helpers/table-schemas';
import { Int, Table, Transaction, Float, DateTime } from 'mssql';
import { LoanHeader } from '../../../interfaces/loan-interface';
import { GenericBDRequest } from '../../types/genericBDRequest';
import { StatusCodes } from '../../../helpers/statusCodes';
import { registerNewLoan } from '../loan/registerNewLoan';

export const registerNewRefinancing = async (
  new_loan_header: LoanHeader,
  refinance: Refinance,
  procTransaction: Transaction
): Promise<GenericBDRequest> => {
  try {
    const {
      fecha: local_date,
      id_usuario,
      id_cliente,
      id_prestamo_actual,
      cantidad_refinanciada
    } = refinance;

    const { cantidad_prestada } = new_loan_header;
    const cantidadRefinanciada = (cantidad_refinanciada as number)

    if (
      cantidad_prestada < 1000.0 ||
      cantidad_prestada < cantidadRefinanciada
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
      cantidadRefinanciada
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

            UPDATE [REPORTE_INVERSION_REAL_SNAPSHOT]
              SET ID_PRESTAMO_ANTERIOR = ${id_prestamo_actual},
                  CANTIDAD_REFINANCIADA = ${cantidadRefinanciada},
                  INVERSION_REAL = INVERSION_TOTAL - ${cantidadRefinanciada}

              WHERE ID_CLIENTE = ${id_cliente}
              AND ID_PRESTAMO_NUEVO = ${idLoanNew}
            
            `
    );

    if (
      !bulkTableRefinanceResult.rowsAffected ||
      !updateIndexes.rowsAffected[0]
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
