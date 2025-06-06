import { Transaction } from 'mssql';

import { DbConnector } from '../../helpers/dbConnector';
import { InsertNewLoanRequest } from '../types/SPInsertNewLoanRequest';
import { StatusResponse } from '../types/loanRequest';
import { validateData } from '../utils/validateData';

export const registerNewLoanRequest = async (
  newLoanRequest: InsertNewLoanRequest
): Promise<StatusResponse> => {
  const pool = await DbConnector.getInstance().connection;
  const procTransaction = new Transaction(pool);
  const { formCliente } = newLoanRequest;
  const { apellido_paterno_cliente } = formCliente;

  try {
    await procTransaction.begin();

    const { tableNewRequestLoan, request_number } = await validateData(
      newLoanRequest,
      procTransaction
    );

    await procTransaction.request().bulk(tableNewRequestLoan);
    await procTransaction.commit();

    return {
      customerFolderName: `${request_number}-${apellido_paterno_cliente}`,
    };
  } catch (error) {
    await procTransaction.rollback();
    let errorMessage = '';

    if (error instanceof Error) {
      errorMessage = error.message as string;
    }

    return { customerFolderName: undefined, error: errorMessage };
  }
};
