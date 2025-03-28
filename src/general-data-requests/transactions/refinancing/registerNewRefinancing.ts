import { refinance } from "../../../helpers/table-schemas";
import { Int, Table, VarChar, Transaction, Float, DateTime } from 'mssql';
import { loanHeader } from '../../../interfaces/loan-interface';
import { genericBDRequest } from '../../types/genericBDRequest';
import { indexes_id } from '../../../helpers/table-schemas';
import { StatusCodes } from '../../../helpers/statusCodes';

export const registerNewRefinancing = async (
    id_current_loan: number,
    current_loan_header: loanHeader,
    refinance: refinance,
    procTransaction: Transaction
): Promise<genericBDRequest> => {
    try {
        const checkIfRefinanced = await procTransaction
            .request()
            .query<indexes_id>(
                `SELECT ID_PRESTAMO_ACT as indice FROM [dbo].[REFINANCIA] WHERE [ID_PRESTAMO_ANT] = ${id_current_loan}; `
            );

        if (checkIfRefinanced.rowsAffected[0]) {
            return {
                message: `El préstamo ya ha sido refinanciado con el préstamo con folio ${checkIfRefinanced.recordset[0].indice}`,
                generatedId: 0,
                error: StatusCodes.BAD_REQUEST,
            };
        }

        const nextIdQuery = await procTransaction
            .request()
            .query<indexes_id>(
                `SELECT [indice] FROM INDICES WHERE OBJETO = 'ID_REFINANCIAMIENTO'; `
            );

        const lastRefinanceId = nextIdQuery.recordset[0].indice;

        const tableRefinanciamiento = new Table('REFINANCIA');
        tableRefinanciamiento.create = false;

        tableRefinanciamiento.columns.add('ID', Int, { nullable: false });
        tableRefinanciamiento.columns.add('FECHA', DateTime, { nullable: false });
        tableRefinanciamiento.columns.add('ID_USUARIO', Int, { nullable: false });
        tableRefinanciamiento.columns.add('ID_CLIENTE', Int, { nullable: false });
        tableRefinanciamiento.columns.add('ID_PRESTAMO_ANT', Int, { nullable: false });
        tableRefinanciamiento.columns.add('ID_PRESTAMO_ACT', Int, { nullable: false });
        tableRefinanciamiento.columns.add('CANTIDAD', Float, { nullable: false });



    } catch (exception) {
        return {
            message: (exception as Error).message,
            generatedId: 0,
            error: StatusCodes.BAD_REQUEST,
        };
    }

}