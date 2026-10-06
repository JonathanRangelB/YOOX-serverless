import sql, { Transaction } from "mssql";
import { GenericBDRequest } from "../../general-data-requests/types/genericBDRequest";
import { StatusCodes } from "../../helpers/statusCodes";
import { Status } from "../../helpers/utils";
import { UpdateOutstCollPlanner } from "../types/SPUpdateOutstCollPlanner.interface";
import { getDiscountAmountDebt } from "../utils/getDiscountAmountDebt";

export const updatePlannerFromLoanReq = async (
  procTransaction: Transaction,
  outstdColl: UpdateOutstCollPlanner,
  loanRequestStatus: string,
  amountToRefinance: number
): Promise<GenericBDRequest> => {
  try {
    const {
      loan_request_id,
      management_id,
      collection_id_agent,
      customer_id,
      customer_name,
      requested_amount,
      customer_neighborhood,
      customer_county,
      group_id,
      last_change_loan_request_utc_date
    } = outstdColl;

    let queryPlannerUpdate = "";

    let discountAmount = 0.0

    if (loanRequestStatus === Status.APROBADO as string)
      discountAmount = amountToRefinance;
    else if (customer_id && [Status.ACTUALIZAR as string, Status.EN_REVISION as string].includes(loanRequestStatus))
      await getDiscountAmountDebt(procTransaction, customer_id);

    switch (loanRequestStatus) {
      case Status.APROBADO:
        queryPlannerUpdate = `UPDATE 
                                  OUTSTANDING_COLLECTIONS_PLANNER
                              
                                SET
                                  COLLECTION_ID_AGENT=@collection_id_agent
                                  ,CUSTOMER_ID=@customer_id
                                  ,CUSTOMER_NAME=@customer_name
                                  ,REQUESTED_AMOUNT=@requested_amount
                                  ,CUSTOMER_NEIGHBORHOOD=@customer_neighborhood
                                  ,CUSTOMER_COUNTY=@customer_county
                                  ,GROUP_ID=@group_id
                                  ,MANAGEMENT_ID=@management_id
                                  ,CAPTURED_ACCOUNT=1
                                  ,ACCOUNTING_DATE=(SELECT FECHA_INICIAL FROM LOAN_REQUEST WHERE ID=${loan_request_id})
                                  ,CLOSE_UTC_DATETIME_STAMP=GETUTCDATE()
                                  ,DISCOUNT_AMOUNT=@discountAmount
                                  ,BUDGET=AUTHORIZED_AMOUNT - ${discountAmount}
                                  ,REAL_INVERSION=AUTHORIZED_AMOUNT - ${discountAmount}

                              `;
        break;
      case Status.RECHAZADO:
        queryPlannerUpdate = `UPDATE 
                                OUTSTANDING_COLLECTIONS_PLANNER 

                              SET
                                CURRENT_STATUS='CANCELADO'
                                ,CLOSE_UTC_DATETIME_STAMP=GETUTCDATE()

                              `;
        break;

      case Status.ACTUALIZAR:
      case Status.EN_REVISION:
        queryPlannerUpdate = `UPDATE 
                                  OUTSTANDING_COLLECTIONS_PLANNER
                              
                                SET
                                  COLLECTION_ID_AGENT=@collection_id_agent
                                  ,CUSTOMER_ID=@customer_id
                                  ,CUSTOMER_NAME=@customer_name
                                  ,REQUESTED_AMOUNT=@requested_amount
                                  ,CUSTOMER_NEIGHBORHOOD=@customer_neighborhood
                                  ,CUSTOMER_COUNTY=@customer_county
                                  ,GROUP_ID=@group_id
                                  ,MANAGEMENT_ID=@management_id
                                  ,LAST_CHANGE_LOAN_REQUEST_UTC_DATE=@last_change_loan_request_utc_date
                                  ,DISCOUNT_AMOUNT=@discountAmount

                              `;
        break;
    }

    const queryFinalUpdate = `${queryPlannerUpdate} WHERE LOAN_REQUEST_ID=@loanRequestId`;
    const poolRequest = procTransaction.request();

    if (loanRequestStatus != Status.RECHAZADO as string) {
      poolRequest.input("collection_id_agent", sql.Int, collection_id_agent);
      poolRequest.input("customer_id", sql.Int, customer_id);
      poolRequest.input("customer_name", sql.VarChar, customer_name);
      poolRequest.input("requested_amount", sql.Float, requested_amount);
      poolRequest.input("customer_neighborhood", sql.VarChar, customer_neighborhood);
      poolRequest.input("customer_county", sql.VarChar, customer_county);
      poolRequest.input("group_id", sql.Int, group_id);
      poolRequest.input("management_id", sql.Int, management_id);
      poolRequest.input("discountAmount", sql.Float, discountAmount);
    }

    if ([Status.ACTUALIZAR as string, Status.EN_REVISION as string].includes(loanRequestStatus)) {
      poolRequest.input("last_change_loan_request_utc_date", sql.DateTime2, last_change_loan_request_utc_date);
    }

    poolRequest.input("loanRequestId", sql.Int, loan_request_id);

    const queryResult = await poolRequest.query(queryFinalUpdate);

    if (!queryResult.rowsAffected[0]) {
      return {
        message: "Ocurrió un error durante la transacción",
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST,
      }
    }

    return {
      message: "Registro actualizado correctamente",
      generatedId: loan_request_id,
      error: StatusCodes.OK,
    }
  }
  catch (error) {
    return {
      message: "Ocurrió un error durante la transacción",
      generatedId: 0,
      error: StatusCodes.BAD_REQUEST,
    }
  }
} 
