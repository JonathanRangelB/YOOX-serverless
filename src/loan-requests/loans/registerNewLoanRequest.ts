import { Date, DateTime, Float, Int, Table, VarChar } from "mssql";

import { DbConnector } from "../../helpers/dbConnector";
import { last_loan_id} from "../../helpers/table-schemas";
import { SPInsertNewLoanRequest } from "../types/SPInsertNewLoanRequest";
import { statusResponse } from "../types/loanRequest";
import { convertToBase36 } from "../../helpers/utils";

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
      .query<last_loan_id>(
        `SELECT ISNULL(MAX(ID), 0) AS LAST_LOAN_ID, GETDATE() AS CURRENT_DATE_SERVER FROM LOAN_REQUEST;`
      );


    spInsertNewLoanRequest.id = nextIdQuery.recordsets[0][0].LAST_LOAN_ID + 1;
    spInsertNewLoanRequest.created_date = nextIdQuery.recordsets[0][0].CURRENT_DATE_SERVER;
   
    spInsertNewLoanRequest.request_number = convertToBase36(spInsertNewLoanRequest.id)



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
   
    tableNewRequestLoan.columns.add("APPROVED_DATE", DateTime, {
      nullable: true,
    });
    tableNewRequestLoan.columns.add("APPROVED_BY", Int, { nullable: true });
    tableNewRequestLoan.columns.add("STATUS_CODE", Int, { nullable: true });

    tableNewRequestLoan.rows.add(
      spInsertNewLoanRequest.id,
      spInsertNewLoanRequest.request_number,
      spInsertNewLoanRequest.id_cliente,
      spInsertNewLoanRequest.id_plazo,
      spInsertNewLoanRequest.cantidad_prestada,
      spInsertNewLoanRequest.dia_semana,
      spInsertNewLoanRequest.fecha_inicial,
      spInsertNewLoanRequest.fecha_final_estimada,
      spInsertNewLoanRequest.id_cobrador,
      spInsertNewLoanRequest.cantidad_pagar,
      spInsertNewLoanRequest.status,
      spInsertNewLoanRequest.tasa_interes,
      spInsertNewLoanRequest.id_grupo_original,
      spInsertNewLoanRequest.created_by,
      spInsertNewLoanRequest.created_date,
      spInsertNewLoanRequest.modified_by,
      spInsertNewLoanRequest.modified_date,
      spInsertNewLoanRequest.approved_date,
      spInsertNewLoanRequest.approved_by,
      spInsertNewLoanRequest.status_code,
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
    return { message, error: errorMessage };
  }
};
