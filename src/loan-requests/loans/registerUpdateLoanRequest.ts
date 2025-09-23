import { Int } from "mssql";
import { DbConnector } from "../../helpers/dbConnector";
import { LoanUpdateDate } from "../../helpers/table-schemas";
import { UpdateLoanRequest } from "../types/SPInsertNewLoanRequest";
import { UpdateStatusResponse } from "../types/loanRequest";
import { registerNewCustomer } from "../../general-data-requests/transactions/customer/registerNewCustomer";
import { convertDateTimeZone } from "../../helpers/utils";
import { updateCustomer } from "../../general-data-requests/transactions/customer/updateCustomer";
import { registerNewEndorsement } from "../../general-data-requests/transactions/endorsement/registerNewEndorsement";
import { updateEndorsement } from "../../general-data-requests/transactions/endorsement/updateEndorsement";
import { validateDataLoanRequestUpdate } from "../utils/validateData";
import { LoanHeader } from "../../interfaces/loan-interface";
import { registerNewLoan } from "../../general-data-requests/transactions/loan/registerNewLoan";
import { Refinance } from "../../helpers/table-schemas";
import { registerNewRefinancing } from "../../general-data-requests/transactions/refinancing/registerNewRefinancing";
import { GenericBDRequest } from "../../general-data-requests/types/genericBDRequest";
import { Status } from "../../helpers/utils";
import { enqueueWAMessageOnDB } from "../../whatsapp/enqueueMessage";
import { fullUpdateLoanReqQuery } from "../utils/queryFullUpdateLoanReq";

export const registerUpdateLoanRequest = async (
  updateLoanRequest: UpdateLoanRequest,
): Promise<UpdateStatusResponse> => {
  const pool = await DbConnector.getInstance().connection;
  const procTransaction = pool.transaction();

  try {
    await procTransaction.begin();
    await validateDataLoanRequestUpdate(updateLoanRequest, procTransaction);

    const queryResult = await procTransaction
      .request()
      .input("ID_LOAN_REQUEST", Int, updateLoanRequest.id)
      .query<LoanUpdateDate>(
        "SELECT id as [loan_id], request_number, loan_request_status, GETUTCDATE() as [current_date_server] FROM LOAN_REQUEST WHERE ID = @ID_LOAN_REQUEST;",
      );

    if (!queryResult.recordset[0]) {
      throw new Error("La solicitud de préstamo no existe");
    }

    // Manejo de concurrencia

    const currentLoanRequestStatus =
      queryResult.recordset[0].loan_request_status;

    if (
      [Status.APROBADO as string, Status.RECHAZADO as string].includes(
        currentLoanRequestStatus,
      )
    ) {
      throw new Error(
        `La solicitud ya ha sido cerrada con el estatus ${currentLoanRequestStatus}`,
      );
    }

    const current_local_date = convertDateTimeZone(
      queryResult.recordset[0].current_date_server,
      "America/Mexico_City",
    ) as Date;

    const {
      id: id_loan_request,
      request_number,
      loan_request_status: newLoanRequestStatus,
      cantidad_prestada,
      cantidad_pagar,
      id_agente,
      id_grupo_original,
      fecha_inicial,
      fecha_final_estimada,
      dia_semana,
      observaciones,
      plazo: datosPlazo,
      formCliente: datosCliente,
      formAval: datosAval,
      modified_by: id_usuario,
      id_loan_to_refinance,
    } = updateLoanRequest;

    const {
      id_cliente,
    } = datosCliente;

    const {
      id_aval,
    } = datosAval;

    const { id: id_plazo, tasa_de_interes, semanas_plazo } = datosPlazo;

    //Comienza ensamblado de la cadena del query
    let updateQueryColumns = "";

    if (
      currentLoanRequestStatus === newLoanRequestStatus ||
      (currentLoanRequestStatus === Status.ACTUALIZAR &&
        [Status.APROBADO as string].includes(newLoanRequestStatus))
    ) {
      throw new Error("Cambio de status incorrecto");
    }

    if (
      currentLoanRequestStatus === Status.ACTUALIZAR &&
      newLoanRequestStatus === Status.RECHAZADO
    ) {
      updateQueryColumns += ` SET 
                        LOAN_REQUEST_STATUS = '${newLoanRequestStatus}' 
                        ,OBSERVACIONES = ${observaciones ? `'${observaciones}'` : `NULL`}
                        ,CLOSED_BY = ${id_usuario} 
                        ,CLOSED_DATE = '${current_local_date.toISOString()}'                                  
        `;
    }
    if (
      currentLoanRequestStatus === Status.ACTUALIZAR &&
      newLoanRequestStatus === Status.EN_REVISION
    ) {
      updateQueryColumns = fullUpdateLoanReqQuery(updateLoanRequest, false)

      updateQueryColumns += `
        ,MODIFIED_BY = ${id_usuario}
        ,MODIFIED_DATE = '${current_local_date.toISOString()}'

      `

    } else if (currentLoanRequestStatus === Status.EN_REVISION) {

      let idClienteGenerado;
      let idPrestamoGenerado;
      let encabezadoPrestamo: LoanHeader;
      let procInsertLoan: GenericBDRequest;

      switch (newLoanRequestStatus) {
        case Status.ACTUALIZAR:
          updateQueryColumns = fullUpdateLoanReqQuery(updateLoanRequest, false);
          updateQueryColumns += ` ,MODIFIED_BY = ${id_usuario}
                                  ,MODIFIED_DATE = '${current_local_date.toISOString()}'                                 
          `;
          break;

        case Status.RECHAZADO:
          updateQueryColumns = ` SET 
                        LOAN_REQUEST_STATUS = '${newLoanRequestStatus}' 
                        ,OBSERVACIONES = ${observaciones ? `'${observaciones}'` : `NULL`}          
                        ,CLOSED_BY = ${id_usuario} 
                        ,CLOSED_DATE = '${current_local_date.toISOString()}'                                  
                                  `;

          break;

        case Status.APROBADO:

          datosCliente.id_agente = id_agente;
          datosCliente.cliente_activo = 1;

          if (!id_aval) {
            datosAval.aval_creado_por = id_usuario;
            datosAval.fecha_creacion_aval = current_local_date;
            datosAval.observaciones_aval = `Solicitud de préstamo ${request_number}`;

            const procNewEndorsement = await registerNewEndorsement(
              datosAval,
              procTransaction,
            );

            if (!procNewEndorsement.idEndorsment) {
              throw new Error(procNewEndorsement.message);
            }

            datosCliente.id_aval = procNewEndorsement.idEndorsment;

          } else {
            datosAval.aval_modificado_por = id_usuario;
            datosAval.fecha_modificacion_aval = current_local_date;

            const procUpdateEndorsement = await updateEndorsement(
              datosAval,
              procTransaction,
            );

            if (!procUpdateEndorsement.generatedId) {
              throw new Error(procUpdateEndorsement.message);
            }

            datosCliente.id_aval = procUpdateEndorsement.generatedId;
          }

          if (!id_cliente) {
            datosCliente.cliente_creado_por = id_usuario;
            datosCliente.fecha_creacion_cliente = current_local_date;
            datosCliente.observaciones_cliente = `Solicitud de préstamo ${request_number}`;

            const procNewCustomer = await registerNewCustomer(
              datosCliente,
              procTransaction,
            );
            if (!procNewCustomer.idCustomer) {
              throw new Error(procNewCustomer.message);
            } else idClienteGenerado = procNewCustomer.idCustomer;


          } else {
            datosCliente.cliente_modificado_por = id_usuario;
            datosCliente.fecha_modificacion_cliente = current_local_date;
            const procUpdateCustomer = await updateCustomer(
              datosCliente,
              procTransaction,
            );
            if (!procUpdateCustomer.generatedId) {
              throw new Error(procUpdateCustomer.message);
            } else idClienteGenerado = procUpdateCustomer.generatedId;
          }

          encabezadoPrestamo = {
            id: 0,
            id_cliente: idClienteGenerado,
            id_plazo: id_plazo,
            id_usuario: id_usuario,
            cantidad_prestada: cantidad_prestada,
            dia_semana: dia_semana,
            fecha_inicial: fecha_inicial,
            fecha_final_estimada: fecha_final_estimada,
            fecha_final_real: fecha_final_estimada,
            id_cobrador: id_agente,
            id_corte: 0,
            cantidad_restante: cantidad_pagar,
            cantidad_pagar: cantidad_pagar,
            estatus: "EMITIDO",
            fecha_cancelado: fecha_final_estimada,
            usuario_cancelo: 0,
            id_concepto: 0,
            id_multa: 0,
            tasa_interes: tasa_de_interes,
            id_grupo_original: id_grupo_original,
            semanas_plazo: Number(semanas_plazo),
          };

          if (id_loan_to_refinance) {
            const encabezadoRefinanciamiento: Refinance = {
              fecha: current_local_date,
              id_usuario: id_usuario,
              id_cliente: idClienteGenerado,
              id_prestamo_actual: id_loan_to_refinance,
            };

            procInsertLoan = await registerNewRefinancing(
              encabezadoPrestamo,
              encabezadoRefinanciamiento,
              procTransaction,
            );
          } else {
            procInsertLoan = await registerNewLoan(
              encabezadoPrestamo,
              procTransaction,
            );
          }

          if (!procInsertLoan.generatedId) {
            throw new Error(procInsertLoan.message);
          } else idPrestamoGenerado = procInsertLoan.generatedId;



          updateQueryColumns = fullUpdateLoanReqQuery(updateLoanRequest, true);

          updateQueryColumns += `,ID_AVAL = ${datosCliente.id_aval}
                                 ,ID_CLIENTE = ${idClienteGenerado}
                                 ,ID_LOAN = ${idPrestamoGenerado}
                                 ,ID_DOMICILIO_CLIENTE = (SELECT ID_DOMICILIO FROM CLIENTES WHERE ID = ${idClienteGenerado})
                                 ,ID_DOMICILIO_AVAL = (SELECT ID_DOMICILIO FROM AVALES WHERE ID_AVAL = ${datosCliente.id_aval})
                                 ,CLOSED_BY = ${id_usuario} 
                                 ,CLOSED_DATE = '${current_local_date.toISOString()}'
                                  `;

          break;

        default:
          throw new Error("Cambio de status incorrecto");
      }
    }

    const updateQueryString = `UPDATE LOAN_REQUEST ${updateQueryColumns} WHERE ID = ${id_loan_request};`;

    const updateResult = await procTransaction
      .request()
      .query(updateQueryString);

    if (!updateResult.rowsAffected[0]) {
      throw new Error("No se actualizó el registro");
    }

    await procTransaction.commit();

    if (
      updateLoanRequest.formCliente.telefono_movil_cliente &&
      updateLoanRequest.loan_request_status !== "ACTUALIZAR"
    ) {
      const message = buildMessageBasedOnStatus(updateLoanRequest);
      await enqueueWAMessageOnDB({
        message,
        queue_ISOdate: new Date().toISOString(),
        target_phone_number:
          process.env.TEST_PHONE ||
          updateLoanRequest.formCliente.telefono_movil_cliente,
      });
    }

    return {
      message: "Requerimiento de préstamo actualizado",
    };
  } catch (error) {
    await procTransaction.rollback();
    let errorMessage = "";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { error: errorMessage };
  }

  function buildMessageBasedOnStatus(
    updateLoanRequest: UpdateLoanRequest,
  ): string {
    switch (updateLoanRequest.loan_request_status) {
      case Status.EN_REVISION:
        return `Hola ${updateLoanRequest.formCliente.nombre_cliente} ${updateLoanRequest.formCliente.apellido_paterno_cliente},\n\nHemos recibido su solicitud de préstamo con folio #${updateLoanRequest.request_number} y se encuentra en revisión.\n\nFinanciera YOOX agradece su preferencia.`;
      case Status.RECHAZADO:
        return `Hola ${updateLoanRequest.formCliente.nombre_cliente} ${updateLoanRequest.formCliente.apellido_paterno_cliente},\n\nSu solicitud de préstamo con folio #${updateLoanRequest.request_number} no fue aprobada.\n\nPóngase en contacto con su agente YOOX para más detalles.\n\nFinanciera YOOX.`;
      default: // APROBADO
        return `Hola ${updateLoanRequest.formCliente.nombre_cliente} ${updateLoanRequest.formCliente.apellido_paterno_cliente},\n\nSu solicitud de préstamo con folio #${updateLoanRequest.request_number} ha sido APROBADA.\n\nFinanciera YOOX agradece su preferencia.`;
    }
  }
};
