import { GenericBDRequest } from "../../general-data-requests/types/genericBDRequest";
import sql from "mssql";
import { StatusCodes } from "../../helpers/statusCodes";
import { DbConnector } from "../../helpers/dbConnector";

export const clearOldRecordsCollPlanner = async (
  idUser: number
): Promise<GenericBDRequest> => {
  try {

    const tableName = 'OUTSTANDING_COLLECTIONS_PLANNER';
    const queryDaysDiffStr = `SELECT 
                            DATEDIFF(DAY, CONVERT(DATE, LAST_CLEAR_ON_UTC_TIME), CONVERT(DATE, GETUTCDATE())) AS DAYS_DIFF

                            FROM
                              dbo.LOG_CLEARED_TABLES

                            WHERE
                              TABLE_NAME = @tableName `


    const poolRequest = await DbConnector.getInstance().connection;
    const procTransaction = poolRequest.transaction();

    await procTransaction.begin();

    const queryDaysDiffResult = await procTransaction
      .request()
      .input("tableName", sql.VarChar, tableName)
      .query(queryDaysDiffStr);

    const queryDaysDiffRecordSet = queryDaysDiffResult.recordset;

    if (!queryDaysDiffRecordSet.length) {

      await procTransaction.rollback();

      return {
        message: `No existen registros para la tabla ${tableName}`,
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST
      }
    }

    const daysDiff = +queryDaysDiffRecordSet[0].DAYS_DIFF;

    if (!daysDiff) {

      await procTransaction.rollback();

      return {
        message: `Tabla ${tableName} ya ha sido actualizada`,
        generatedId: 1,
        error: StatusCodes.OK
      }
    }

    const clearTableStr = `DELETE
                            FROM dbo.[OUTSTANDING_COLLECTIONS_PLANNER]
                          WHERE
                            (
                              (CURRENT_STATUS = 'AUTORIZADO' AND CAPTURED_ACCOUNT = 1)
                              OR CURRENT_STATUS = 'CANCELADO'
                            )
                            AND DATEDIFF(DAY, CONVERT(DATE, CLOSE_UTC_DATETIME_STAMP), CONVERT(DATE, GETUTCDATE())) > 3


                          UPDATE 
                            dbo.LOG_CLEARED_TABLES
                          SET	
                            LAST_CLEAR_ON_UTC_TIME = GETUTCDATE()
                            ,CLEARED_BY_USER_ID = @idUser
                          WHERE
                            TABLE_NAME = @tableName `;

    await procTransaction
      .request()
      .input("idUser", sql.Int, idUser)
      .input("tableName", sql.VarChar, tableName)
      .query(clearTableStr);

    await procTransaction.commit();

    return {
      message: `Tabla ${tableName} actualizada`,
      generatedId: 1,
      error: StatusCodes.OK
    }
  } catch (exception) {
    return {
      message: (exception as Error).message,
      generatedId: 0,
      error: StatusCodes.BAD_REQUEST
    }
  }
}
