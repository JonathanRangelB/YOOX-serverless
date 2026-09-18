import sql, { Table, Transaction } from "mssql";
import { GenericBDRequest } from "../../general-data-requests/types/genericBDRequest";
import { StatusCodes } from "../../helpers/statusCodes";
import { getCreditTypeCollection } from "../utils/getCreditTypeCollections";
import { getDiscountAmountDebt } from "../utils/getDiscountAmountDebt";
import { CreditType, Status } from "../../helpers/utils";
import { InsertNewLoanRequest } from "../../loan-requests/types/SPInsertNewLoanRequest";

export const registerNewOutstdCollection = async (
  procTransaction: Transaction,
  loanRequestId: number,
  loanRequestObject: InsertNewLoanRequest
): Promise<GenericBDRequest> => {
  try {

    const {
      formCliente,
      cantidad_prestada: authorized_amount
    } = loanRequestObject;

    const {
      id_cliente: customerId
    } = formCliente;

    let credit_type = "";

    if (customerId) {
      const creditTypeResponse = await getCreditTypeCollection(procTransaction, customerId);
      credit_type = creditTypeResponse.message;
    }
    else {
      credit_type = CreditType.NUEVO as string;
    }

    let discount_amount = 0.0;

    if ([CreditType.REACTIVACION as string, CreditType.NUEVO as string].includes(credit_type)) {
      discount_amount = 0.0;
    } else if (credit_type === CreditType.RENOVACION) {
      const discountAmountResponse = await getDiscountAmountDebt(procTransaction, customerId);

      if (discountAmountResponse.generatedId > 0)
        discount_amount = +discountAmountResponse.message;
      else
        credit_type = CreditType.NUEVO as string;
    }

    const budget = authorized_amount - discount_amount;

    const queryInsert = `INSERT INTO OUTSTANDING_COLLECTIONS_PLANNER (
                            LOAN_REQUEST_ID
                            ,LOAN_REQUEST_NUMBER
                            ,INSERT_UTC_DATETIME_STAMP
                            ,LOAN_REQUEST_UTC_DATE
                            ,COLLECTION_ID_AGENT
                            ,CUSTOMER_ID
                            ,CUSTOMER_NAME
                            ,CREDIT_TYPE
                            ,REQUESTED_AMOUNT
                            ,AUTHORIZED_AMOUNT
                            ,DISCOUNT_AMOUNT
                            ,CUSTOMER_NEIGHBORHOOD
                            ,CUSTOMER_COUNTY
                            ,BUDGET
                            ,REAL_INVERSION
                            ,GROUP_ID
                            ,MANAGEMENT_ID
                          )
                          
                            SELECT
                            LOAN_REQUEST.ID
                            ,LOAN_REQUEST.[REQUEST_NUMBER]
                            ,GETUTCDATE()
                            ,LOAN_REQUEST.CREATE_UTC_DATETIME
                            ,LOAN_REQUEST.[ID_AGENTE]
                            ,LOAN_REQUEST.[ID_CLIENTE]
                            ,LOAN_REQUEST.[NOMBRE_CLIENTE] + ' ' + LOAN_REQUEST.[APELLIDO_PATERNO_CLIENTE] + ' ' + LOAN_REQUEST.[APELLIDO_MATERNO_CLIENTE]
                            ,'${credit_type}'
                            ,LOAN_REQUEST.[CANTIDAD_PRESTADA]
                            ,LOAN_REQUEST.[CANTIDAD_PRESTADA]
                            ,${discount_amount}
                            ,LOAN_REQUEST.[COLONIA_CLIENTE]
                            ,LOAN_REQUEST.[MUNICIPIO_CLIENTE]
                            ,${budget}
                            ,0.00
                            ,LOAN_REQUEST.ID_GRUPO_ORIGINAL
                            ,LOAN_REQUEST.ID_GERENCIA_ORIGINAL
                            
                            FROM LOAN_REQUEST
                            
                            WHERE
                            ID=@loanRequestId

                            `;

    console.log(queryInsert);

    const poolRequest = procTransaction.request();

    poolRequest.input("loanRequestId", sql.Int, loanRequestId);

    const insertResult = await poolRequest.query(queryInsert);

    if (insertResult.rowsAffected[0] <= 0) {
      return {
        message: "No se pudo registrar en Planificador de cobranza",
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST,
      }
    }

    return {
      message: "Registro guardado correctamente en Planificador de cobranza",
      generatedId: loanRequestId,
      error: StatusCodes.OK,
    }

  } catch (exception) {
    return {
      message: (exception as Error).message,
      generatedId: 0,
      error: StatusCodes.BAD_REQUEST,
    }
  }
}

