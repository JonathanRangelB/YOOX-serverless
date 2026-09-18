import sql, { Transaction } from "mssql";
import { CreditType, LoanStatus } from "../../helpers/utils";
import { GenericBDRequest } from "../../general-data-requests/types/genericBDRequest";
import { StatusCodes } from "../../helpers/statusCodes";

export const getCreditTypeCollection = async (
  procTransaction: Transaction,
  customerId: number,
): Promise<GenericBDRequest> => {
  try {
    const queryStatement = `WITH TAB AS (
                                SELECT
                                ID,
                                FECHA_INICIAL,
                                STATUS,
                                CAST(GETDATE() AS DATE)  AS [CURRENT_DATE],
                                ROW_NUMBER () OVER (PARTITION BY STATUS ORDER BY FECHA_INICIAL DESC ) AS [RANK_NUMBER]
                                
                                FROM
                                PRESTAMOS
                                
                                WHERE ID_CLIENTE = @customerId
                                AND STATUS <> 'CANCELADO'
                              )
                              
                              SELECT
                                ID,
                                FECHA_INICIAL,
                                STATUS,
                                [CURRENT_DATE],
                                DATEDIFF(DAY,FECHA_INICIAL, CURRENT_DATE) AS [DAYS_DIFFERENCE]
                              FROM
                                TAB

                              WHERE
                                [RANK_NUMBER] = 1

                              ORDER BY FECHA_INICIAL DESC
                              `


    const poolRequest = procTransaction.request();
    poolRequest.input("customerId", sql.Int, customerId);

    const sqlResponse = await poolRequest.query(queryStatement);
    const recordSet = sqlResponse.recordset;

    if (recordSet.length <= 0) {
      return { message: CreditType.NUEVO, generatedId: customerId };
    }

    const loanActive = recordSet?.some(item => item.STATUS as string === LoanStatus.EMITIDO as string)

    if (loanActive) {
      return { message: CreditType.RENOVACION as string, generatedId: customerId };
    }

    const loanHistorical = recordSet?.find(item => [LoanStatus.PAGADO as string, LoanStatus.REFINANCIADO as string].includes(item.STATUS));
    const daysDifference = loanHistorical.DAYS_DIFFERENCE;

    if (daysDifference > 120)
      return { message: CreditType.NUEVO, generatedId: customerId };
    else if (daysDifference <= 120)
      return { message: CreditType.REACTIVACION, generatedId: customerId };

    return { message: "", generatedId: 0 };
  }
  catch (exception) {
    return {
      message: (exception as Error).message,
      generatedId: 0,
      error: StatusCodes.BAD_REQUEST
    }
  }
};
