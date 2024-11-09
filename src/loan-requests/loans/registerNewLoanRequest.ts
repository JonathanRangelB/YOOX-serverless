import { Transaction } from 'mssql';

import { DbConnector } from '../../helpers/dbConnector';
import { SPInsertNewLoanRequest } from '../types/SPInsertNewLoanRequest';
import { statusResponse } from '../types/loanRequest';
import { validateData } from '../utils/validateData';

export const registerNewLoanRequest = async (
  newLoanRequest: SPInsertNewLoanRequest
): Promise<statusResponse> => {
  const pool = await DbConnector.getInstance().connection;
  const procTransaction = new Transaction(pool);
  const { apellido_paterno_cliente } = newLoanRequest;

  try {
    await procTransaction.begin();
    const { tableNewRequestLoan, request_number } =
      await validateData(newLoanRequest);
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
