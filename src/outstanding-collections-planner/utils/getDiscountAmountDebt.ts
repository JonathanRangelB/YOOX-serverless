import sql, { Transaction } from "mssql";
import { GenericBDRequest } from "../../general-data-requests/types/genericBDRequest";
import { StatusCodes } from "../../helpers/statusCodes";
import { querySearchLoanToRefinance } from "../../general-data-requests/utils/querySearchLoanToRefinance";

export const getDiscountAmountDebt = async (
  procTransaction: Transaction,
  customerId: number
): Promise<GenericBDRequest> => {

  if (!customerId) {
    return {
      message: "Invalid user id",
      generatedId: 0,
      error: StatusCodes.BAD_REQUEST
    }
  }

  try {
    const queryStatement = querySearchLoanToRefinance(" top 1 t0.id, t0.id_cliente, t0.cantidad_restante as [CANTIDAD_RESTANTE] ", " where t0.id_cliente = @customerId ")
    console.log(queryStatement);
    const poolRequest = procTransaction.request();

    poolRequest.input("customerId", sql.Int, customerId);
    const sqlResponse = await poolRequest.query(queryStatement);
    const recordSet = sqlResponse.recordset;

    if (recordSet.length <= 0) {
      return { message: "0.0", generatedId: 0 };
    }

    const debtAmount = recordSet[0].CANTIDAD_RESTANTE as string;

    return { message: debtAmount, generatedId: customerId };
  }

  catch (exception) {
    return {
      message: (exception as Error).message,
      generatedId: 0,
      error: StatusCodes.BAD_REQUEST
    }
  }
} 
