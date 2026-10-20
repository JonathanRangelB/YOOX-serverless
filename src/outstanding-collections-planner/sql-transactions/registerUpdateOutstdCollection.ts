import sql, { Transaction } from "mssql";
import { GenericBDRequest } from "../../general-data-requests/types/genericBDRequest";
import { StatusCodes } from "../../helpers/statusCodes";
import { isInvalidID, LoanStatus, PlannerCurrentStatus, RolesDeUsuario, Status } from "../../helpers/utils";
import { getDiscountAmountDebt } from "../utils/getDiscountAmountDebt";
import { CollectionsPlannerPatchRequest } from "../types/PayloadInterfacePlanner.interface";

export const registerUpdateOutstdCollection = async (
  procTransaction: Transaction,
  outstdColl: CollectionsPlannerPatchRequest
): Promise<GenericBDRequest> => {
  try {

    const {
      loan_request_id,
      revised_record,
      authorized_amount,
      primary_borrower_call_status,
      guarantor_call_status,
      current_status,
      observations,
      modified_by
    } = outstdColl;

    if (!loan_request_id) {
      return {
        message: "Registro no válido",
        generatedId: 0,
        error: StatusCodes.NOT_FOUND
      }
    }

    //Verify that user modifying has the right user role and it's valid
    const queryUserStr = `SELECT ID, NOMBRE, ROL, ACTIVO FROM USUARIOS WHERE ID=@idUser `;
    const queryUser = await procTransaction
      .request()
      .input("idUser", sql.Int, modified_by)
      .query(queryUserStr)

    //Verify user exists
    const recordSetUser = queryUser.recordset;

    if (recordSetUser.length <= 0) {
      return {
        message: `El usuario ${modified_by} no existe`,
        generatedId: 0,
        error: StatusCodes.NOT_FOUND
      }
    }

    const userRole = recordSetUser[0].ROL as string;
    const userIsActive = +recordSetUser[0].ACTIVO;
    const userName = recordSetUser[0].NOMBRE as string;

    //Verify user is active
    if (!userIsActive) {
      return {
        message: `El usuario ${modified_by} - ${userName} no se encuentra habilitado en el sistema`,
        generatedId: 0,
        error: StatusCodes.NOT_FOUND
      }
    }

    //Verify user has the right role
    if ([RolesDeUsuario.LIDER_DE_GRUPO as string, RolesDeUsuario.COBRADOR as string].includes(userRole)) {
      return {
        message: `El usuario ${modified_by} - ${userName} no tiene privilegios para modificar este registro`,
        generatedId: 0,
        error: StatusCodes.NOT_FOUND
      }
    }
    //*******

    //Concurrency: Loan request is valid
    const querySetLoanReq = await procTransaction
      .request()
      .input("loanRequestId", sql.Int, loan_request_id)
      .query("SELECT ID, REQUEST_NUMBER, LOAN_REQUEST_STATUS, CANTIDAD_PRESTADA, OBSERVACIONES FROM LOAN_REQUEST WHERE ID=@loanRequestId")

    const recordSetLoanReq = querySetLoanReq.recordset;

    //Verify the record exists
    if (recordSetLoanReq.length <= 0) {
      return {
        message: "No se encontró la solicitud de préstamo o no es válida.",
        generatedId: 0,
        error: StatusCodes.NOT_FOUND
      }
    }

    const loanRequestStatus = recordSetLoanReq[0].LOAN_REQUEST_STATUS as string;
    const loanRequestNumber = recordSetLoanReq[0].REQUEST_NUMBER as string;

    //Verify the loan has any open status 
    if ([LoanStatus.CANCELADO as string, LoanStatus.PAGADO as string, LoanStatus.REFINANCIADO as string].includes(loanRequestStatus)) {
      return {
        message: `La solicitud de préstamo ${loanRequestNumber} está cerrada con estatus ${loanRequestStatus}`,
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST
      }
    }

    //*******

    //Verify the current record in planner is valid    
    //
    const queryRecord = `SELECT
                          LOAN_REQUEST_ID
                          ,CURRENT_STATUS
                          ,CUSTOMER_ID
                          ,GETUTCDATE() AS [SERVER_DATETIME]  
                          ,CAPTURED_ACCOUNT

                        FROM 
                          OUTSTANDING_COLLECTIONS_PLANNER 

                        WHERE 
                          LOAN_REQUEST_ID=@loanRequestId 

                          `

    const queryOutstnPlannerRecord = await procTransaction
      .request()
      .input("loanRequestId", sql.Int, loan_request_id)
      .query(queryRecord);

    const recordSetOutstnPlanner = queryOutstnPlannerRecord.recordset;

    if (recordSetOutstnPlanner.length <= 0) {
      return {
        message: `El registro ${loanRequestNumber} del planificador de cobranza no es válido`,
        generatedId: 0,
        error: StatusCodes.NOT_FOUND
      }
    }

    const currentStatusOutstnPlanner = recordSetOutstnPlanner[0].CURRENT_STATUS as string;

    if (PlannerCurrentStatus.CANCELADO as string === currentStatusOutstnPlanner) {
      return {
        message: `El registro ${loanRequestNumber} ya está cerrado con estatus ${currentStatusOutstnPlanner} en el Planificador de cobranza`,
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST
      }
    }
    const capturedAccount = +recordSetOutstnPlanner[0].CAPTURED_ACCOUNT;

    if (capturedAccount) {
      return {
        message: `El registro ${loanRequestNumber} ya está marcado como CUENTA CAPTURADA en el Planificador de cobranza`,
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST
      }
    }

    if (current_status === PlannerCurrentStatus.AUTORIZADO as string && !revised_record) {
      return {
        message: `El registro ${loanRequestNumber} no ha sido marcado como REVISADO en el Planificador de cobranza`,
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST
      }
    }

    if (current_status === PlannerCurrentStatus.AUTORIZADO as string && !authorized_amount) {
      return {
        message: `La cantidad de préstamo autorizada en ${loanRequestNumber} no es válida`,
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST
      }
    }

    //*******

    //Get all the necessary values for the update

    const current_UTC_datetime_server = recordSetOutstnPlanner[0].SERVER_DATETIME as string;
    const customer_id_str = recordSetOutstnPlanner[0].CUSTOMER_ID as string;

    ///Checks if there is any customer Id
    let customer_id;

    if (isInvalidID(customer_id_str))
      customer_id = 0;
    else
      customer_id = +customer_id_str;

    ///Gets the amount to discount 
    let discount_amount_debt = 0.0;

    if (customer_id) {
      const discountResult = await getDiscountAmountDebt(procTransaction, customer_id);

      if (discountResult.generatedId)
        discount_amount_debt = +discountResult.message;
    }

    if (current_status != PlannerCurrentStatus.CANCELADO as string && discount_amount_debt > authorized_amount) {
      return {
        message: `La cantidad de descuento no puede ser mayor a la cantidad autorizada`,
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST
      }
    }

    const budget = authorized_amount - discount_amount_debt;

    //Begin the update of the outstnCollectionRecord

    const poolRequest = procTransaction.request();

    switch (current_status) {
      case PlannerCurrentStatus.AUTORIZADO:
        poolRequest.input("realInversion", sql.Float, budget);
        break;
    }

    const queryUpdateOutstdColl = createQuery(current_status);

    if (current_status != PlannerCurrentStatus.CANCELADO as string) {
      poolRequest.input("revisedRecord", sql.Bit, revised_record);
      poolRequest.input("authorizedAmount", sql.Float, authorized_amount);
      poolRequest.input("discountAmount", sql.Float, discount_amount_debt);
      poolRequest.input("primaryBorrowerCallStatus", sql.VarChar, primary_borrower_call_status);
      poolRequest.input("guarantorCallStatus", sql.VarChar, guarantor_call_status);
      poolRequest.input("currentStatus", sql.VarChar, current_status);
      poolRequest.input("budget", sql.Float, budget);
      poolRequest.input("observations", sql.VarChar, observations);
      poolRequest.input("dateTimeServer", sql.DateTime2, current_UTC_datetime_server);
      poolRequest.input("modifiedBy", sql.Int, modified_by);
    } else {

      poolRequest.input("currentStatus", sql.VarChar, current_status);
      poolRequest.input("observations", sql.VarChar, observations);
      poolRequest.input("dateTimeServer", sql.DateTime2, current_UTC_datetime_server);
      poolRequest.input("modifiedBy", sql.Int, modified_by);
    }

    poolRequest.input("loanRequestId", sql.Int, loan_request_id);

    const queryResult = await poolRequest.query(queryUpdateOutstdColl);

    if (queryResult.rowsAffected[0] <= 0) {
      return {
        message: "Ocurrió un error durante la transacción",
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST,
      }
    }

    if (current_status === (PlannerCurrentStatus.CANCELADO as string)) {

      const loanRequestObservations = recordSetLoanReq[0].OBSERVACIONES;
      const observationsLoanReq = `${loanRequestObservations}

                                    RECHAZADO CON CANCELACIÓN DEL REGISTRO ${loanRequestNumber} EN EL PLANIFICADOR DE COBRANZA
                                    FECHA Y HORA DEL SERVIDOR: ${current_UTC_datetime_server}
                                    USUARIO: ${modified_by} - ${userName}
                                    `;

      const queryLoanRejected = ` UPDATE
                                    LOAN_REQUEST
                                    
                                  SET
                                    LOAN_REQUEST_STATUS = @newLoanRequestStatus
                                    ,CLOSED_BY = @closed_by_id_usuario
                                    ,CLOSED_UTC_DATETIME = @closed_date_utc_datetime
                                    ,OBSERVACIONES = @observaciones

                                  WHERE
                                    ID = @id_loan_request `;


      const poolReqUpdateLoanReq = procTransaction.request();

      poolReqUpdateLoanReq.input("newLoanRequestStatus", sql.VarChar, Status.RECHAZADO as string);
      poolReqUpdateLoanReq.input("closed_by_id_usuario", sql.Int, modified_by);
      poolReqUpdateLoanReq.input("closed_date_utc_datetime", sql.DateTime2(0), current_UTC_datetime_server);
      poolReqUpdateLoanReq.input("observaciones", sql.VarChar, observationsLoanReq);
      poolReqUpdateLoanReq.input("id_loan_request", sql.Int, loan_request_id);

      const updateLoanReqResult = await poolReqUpdateLoanReq.query(queryLoanRejected);

      if (updateLoanReqResult.rowsAffected[0] <= 0) {
        return {
          message: "Ocurrió un error durante la transacción",
          generatedId: 0,
          error: StatusCodes.BAD_REQUEST,
        }
      }
    }

    return {
      message: `Registro actualizado`,
      generatedId: loan_request_id,
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


function createQuery(
  plannerStatus: string,
): string {
  let queryString = "";
  let caseString = "";

  switch (plannerStatus) {
    case PlannerCurrentStatus.CANCELADO:
      queryString = `UPDATE OUTSTANDING_COLLECTIONS_PLANNER
                      SET 
                        CURRENT_STATUS = @currentStatus, 
                        MODIFIED_BY = @modifiedBy,
                        OBSERVATIONS = @observations,
                        CLOSE_UTC_DATETIME_STAMP = @dateTimeServer
                      WHERE
                        LOAN_REQUEST_ID=@loanRequestId`;
      break;

    case PlannerCurrentStatus.AUTORIZADO:
      caseString = `,REAL_INVERSION = @realInversion
                              `;
      break;
  }

  if ([PlannerCurrentStatus.AUTORIZADO as string,
  PlannerCurrentStatus.EN_ESPERA as string,
  PlannerCurrentStatus.POR_DEFINIR as string].includes(plannerStatus)) {

    queryString = `
                                  UPDATE
                                    OUTSTANDING_COLLECTIONS_PLANNER

                                  SET
                                    REVISED_RECORD = @revisedRecord
                                    ,AUTHORIZED_AMOUNT = @authorizedAmount
                                    ,DISCOUNT_AMOUNT = @discountAmount
                                    ,PRIMARY_BORROWER_CALL_STATUS = @primaryBorrowerCallStatus
                                    ,GUARANTOR_CALL_STATUS = @guarantorCallStatus
                                    ,CURRENT_STATUS = @currentStatus
                                    ,BUDGET = @budget
                                    ,OBSERVATIONS = @observations
                                    ,LAST_CHANGE_UTC_DATE = @dateTimeServer
                                    ,MODIFIED_BY = @modifiedBy
                                    ${caseString}

                                  WHERE
                                    LOAN_REQUEST_ID = @loanRequestId
      `;
  }
  return queryString;
}


