import { DbConnector } from '../../helpers/dbConnector';

export const getLastLoadId = async () => {
  try {
    const pool = await DbConnector.getInstance().connection;
    const lastLoanId = await pool
      .request()
      .query(`SELECT MAX(ID), GETDATE() FROM LOAN_REQUEST;`);

    return { lastLoanId };
  } catch (err) {
    return { err };
  }
};
