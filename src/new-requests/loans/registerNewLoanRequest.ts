import { Date, DateTime, Float, Int, Table, VarChar } from "mssql";

import { DbConnector } from "../../helpers/dbConnector";
import { loan_request } from "../../helpers/table-schemas";
import { SPInsertNewLoanRequest } from "../types/SPInsertNewLoanRequest";
import { statusResponse } from "../types/loanRequest";

export const registerNewLoanRequest = async (
  spInsertNewLoanRequest: SPInsertNewLoanRequest,
): Promise<statusResponse> => {
  let message = "";
  const pool = await DbConnector.getInstance().connection;
  const procTransaction = pool.transaction();

  try {
    await procTransaction.begin();

    const nextIdQuery = await procTransaction
      .request()
      .query<loan_request>(
        `SELECT * FROM LOAN_REQUEST WHERE ID = (SELECT MAX(ID) FROM LOAN_REQUEST)`,
      );
    const nextId =
      nextIdQuery.recordset.length > 0
        ? nextIdQuery.recordsets[0][0].ID + 1
        : 1;

    spInsertNewLoanRequest.ID = nextId;

    const tableNewRequestLoan = new Table("LOAN_REQUEST");
    tableNewRequestLoan.create = false;

    tableNewRequestLoan.columns.add("ID", Int, { nullable: false });
    tableNewRequestLoan.columns.add("REQUEST_NUMBER", VarChar, {
      nullable: false,
    });
    tableNewRequestLoan.columns.add("ID_CLIENTE", Int, { nullable: true });
    tableNewRequestLoan.columns.add("ID_PLAZO", Int, { nullable: false });
    tableNewRequestLoan.columns.add("CANTIDAD_PRESTADA", Float, {
      nullable: false,
    });
    tableNewRequestLoan.columns.add("DIA_SEMANA", VarChar, { nullable: false });
    tableNewRequestLoan.columns.add("FECHA_INICIAL", Date, { nullable: false });
    tableNewRequestLoan.columns.add("FECHA_FINAL_ESTIMADA", Date, {
      nullable: false,
    });
    tableNewRequestLoan.columns.add("ID_COBRADOR", Int, { nullable: false });
    tableNewRequestLoan.columns.add("CANTIDAD_PAGAR", Float, {
      nullable: true,
    });
    tableNewRequestLoan.columns.add("STATUS", VarChar, { nullable: true });
    tableNewRequestLoan.columns.add("TASA_INTERES", Int, { nullable: true });
    tableNewRequestLoan.columns.add("ID_GRUPO_ORIGINAL", Int, {
      nullable: true,
    });
    tableNewRequestLoan.columns.add("CREATED_BY", Int, { nullable: false });
    tableNewRequestLoan.columns.add("CREATED_DATE", DateTime, {
      nullable: true,
    });
    tableNewRequestLoan.columns.add("MODIFIED_BY", Int, { nullable: true });
    tableNewRequestLoan.columns.add("MODIFIED_DATE", DateTime, {
      nullable: true,
    });
    tableNewRequestLoan.columns.add("APPROVED_DATE", DateTime, {
      nullable: true,
    });
    tableNewRequestLoan.columns.add("APPROVED_BY", Int, { nullable: true });
    tableNewRequestLoan.columns.add("STATUS_CODE", Int, { nullable: true });

    tableNewRequestLoan.rows.add(
      spInsertNewLoanRequest.ID,
      spInsertNewLoanRequest.REQUEST_NUMBER,
      spInsertNewLoanRequest.ID_CLIENTE,
      spInsertNewLoanRequest.ID_PLAZO,
      spInsertNewLoanRequest.CANTIDAD_PRESTADA,
      spInsertNewLoanRequest.DIA_SEMANA,
      spInsertNewLoanRequest.FECHA_INICIAL,
      spInsertNewLoanRequest.FECHA_FINAL_ESTIMADA,
      spInsertNewLoanRequest.ID_COBRADOR,
      spInsertNewLoanRequest.CANTIDAD_PAGAR,
      spInsertNewLoanRequest.STATUS,
      spInsertNewLoanRequest.TASA_INTERES,
      spInsertNewLoanRequest.ID_GRUPO_ORIGINAL,
      spInsertNewLoanRequest.CREATED_BY,
      spInsertNewLoanRequest.CREATED_DATE,
      spInsertNewLoanRequest.MODIFIED_BY,
      spInsertNewLoanRequest.MODIFIED_DATE,
      spInsertNewLoanRequest.APPROVED_DATE,
      spInsertNewLoanRequest.APPROVED_BY,
      spInsertNewLoanRequest.STATUS_CODE,
    );

    const reqBulkInsertion = procTransaction.request();
    await reqBulkInsertion.bulk(tableNewRequestLoan);
    await procTransaction.commit();

    message = `Alta de nuevo requerimiento terminó de manera exitosa`;
    return { message };
  } catch (error) {
    await procTransaction.rollback();
    let message = "";
    let errorMessage = "";

    if (error instanceof Error) {
      message = `Error durante la transacción`;
      errorMessage = error.message as string;
    }
    console.log({ message, error });
    return { message, err: errorMessage };
  }
};

