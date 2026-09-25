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
                                STATUS,
                                CAST(GETDATE() AS DATE)  AS [CURRENT_DATE],
                                ROW_NUMBER () OVER (PARTITION BY STATUS ORDER BY ID DESC ) AS [RANK_NUMBER]
                                
                                FROM
                                PRESTAMOS
                                
                                WHERE ID_CLIENTE=@customerId
                                AND STATUS <> 'CANCELADO'
                              ),
                              
                            TAB_PY AS (

                                SELECT 
                                ID_PRESTAMO
                                ,ID_CLIENTE
                                ,[ULTIMA_FECHA_PAGO_UTC] 

                                FROM (

                                SELECT 
                                p.ID_PRESTAMO
                                , p.ID_CLIENTE
                                , p.NUMERO_SEMANA
                                , CONVERT(DATE, p.DATETIME_STAMP_SERVER) AS [ULTIMA_FECHA_PAGO_UTC]  
                                ,ROW_NUMBER() OVER (PARTITION BY ID_CLIENTE, ID_PRESTAMO ORDER BY p.NUMERO_SEMANA DESC) AS RANK_NUMBER

                                FROM 
                                PAGOS p 
                              ) AS T_PAGOS

                              WHERE
                                RANK_NUMBER=1
                                AND ID_CLIENTE=@customerId

                            )

                              
                              SELECT
                                A.ID,
                                B.[ULTIMA_FECHA_PAGO_UTC],
                                A.STATUS,
                                A.[CURRENT_DATE],
                                DATEDIFF(DAY,B.[ULTIMA_FECHA_PAGO_UTC], A.[CURRENT_DATE]) AS [DAYS_DIFFERENCE]
                              FROM
                                TAB A
                              LEFT JOIN TAB_PY B ON A.ID=B.ID_PRESTAMO
                              

                              WHERE
                                [RANK_NUMBER] = 1

                              ORDER BY ID DESC
	
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
    const daysDifference = +loanHistorical.DAYS_DIFFERENCE;

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
