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
import { querySearchLoanToRefinance } from '../../general-data-requests/utils/querySearchLoanToRefinance';
import { StatusCodes } from '../../helpers/statusCodes';

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
      nombre_cliente,
      apellido_paterno_cliente,
      apellido_materno_cliente,
      telefono_fijo_cliente,
      telefono_movil_cliente,
      correo_electronico_cliente,
      ocupacion_cliente,
      curp_cliente,
      tipo_calle_cliente,
      nombre_calle_cliente,
      numero_exterior_cliente,
      numero_interior_cliente,
      colonia_cliente,
      municipio_cliente,
      estado_cliente,
      cp_cliente,
      referencias_dom_cliente,
      id_domicilio_cliente,
    } = datosCliente;

    const {
      id_aval,
      nombre_aval,
      apellido_paterno_aval,
      apellido_materno_aval,
      telefono_fijo_aval,
      telefono_movil_aval,
      correo_electronico_aval,
      curp_aval,
      tipo_calle_aval,
      nombre_calle_aval,
      numero_exterior_aval,
      numero_interior_aval,
      colonia_aval,
      municipio_aval,
      estado_aval,
      cp_aval,
      referencias_dom_aval,
      id_domicilio_aval,
    } = datosAval;

    const { id: id_plazo, tasa_de_interes, semanas_plazo } = datosPlazo;

    //Si hay un préstamo para refinanciar, aquí se verifica que
    //el folio del préstamo siga disponible para refinanciamiento

    let cantidad_restante_anterior = 0.0;

    if (id_loan_to_refinance) {
      const queryCheckIfValid = `${querySearchLoanToRefinance('t0.id as id_prestamo, t0.id_cliente, t0.cantidad_restante')} where t0.id_cliente = ${id_cliente} and t0.id = ${id_loan_to_refinance} `;

      const checkIfValid = await procTransaction
        .request()
        .query(queryCheckIfValid);

      if (!checkIfValid.rowsAffected[0]) {
        return {
          message: `El préstamo con folio ${id_loan_to_refinance} ya no puede ser refinanciado, elimine el préstamo a refinanciar.`,
          statusCode: StatusCodes.CONFLICT
        };
      }

      cantidad_restante_anterior = checkIfValid.recordset[0].cantidad_restante;
    }

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
      updateQueryColumns = `SET 
      LOAN_REQUEST_STATUS = '${newLoanRequestStatus}'
      ,ID_AGENTE = ${id_agente}
      ,ID_GRUPO_ORIGINAL = ${id_grupo_original}
      ,ID_CLIENTE = ${id_cliente ? id_cliente : `NULL`}
      ,NOMBRE_CLIENTE = '${nombre_cliente.trim().toUpperCase()}'
      ,APELLIDO_PATERNO_CLIENTE = '${apellido_paterno_cliente.trim().toUpperCase()}'
      ,APELLIDO_MATERNO_CLIENTE = '${apellido_materno_cliente.trim().toUpperCase()}'
      ,TELEFONO_FIJO_CLIENTE = ${telefono_fijo_cliente ? `'${telefono_fijo_cliente}'` : `NULL`}
      ,TELEFONO_MOVIL_CLIENTE = '${telefono_movil_cliente}'
      ,CORREO_ELECTRONICO_CLIENTE = ${correo_electronico_cliente ? `'${correo_electronico_cliente}'` : `NULL`}
      ,OCUPACION_CLIENTE = ${ocupacion_cliente ? `'${ocupacion_cliente}'` : `NULL`}
      ,CURP_CLIENTE = '${curp_cliente}'
      ,ID_DOMICILIO_CLIENTE = ${id_domicilio_cliente ? id_domicilio_cliente : `NULL`}
      ,TIPO_CALLE_CLIENTE = '${tipo_calle_cliente.value}' 
      ,NOMBRE_CALLE_CLIENTE = '${nombre_calle_cliente}' 
      ,NUMERO_EXTERIOR_CLIENTE = ${numero_exterior_cliente ? `'${numero_exterior_cliente}'` : `NULL`}
      ,NUMERO_INTERIOR_CLIENTE = ${numero_interior_cliente ? `'${numero_interior_cliente}'` : `NULL`} 
      ,COLONIA_CLIENTE = '${colonia_cliente}' 
      ,MUNICIPIO_CLIENTE = '${municipio_cliente}' 
      ,ESTADO_CLIENTE = '${estado_cliente.value}' 
      ,CP_CLIENTE = '${cp_cliente}'
      ,REFERENCIAS_DOM_CLIENTE = ${referencias_dom_cliente ? `'${referencias_dom_cliente}'` : `NULL`}
      ,ID_AVAL = ${id_aval ? id_aval : `NULL`}
      ,NOMBRE_AVAL = '${nombre_aval.trim()}'
      ,APELLIDO_PATERNO_AVAL = '${apellido_paterno_aval.trim().toUpperCase()}'
      ,APELLIDO_MATERNO_AVAL = '${apellido_materno_aval.trim().toUpperCase()}'
      ,TELEFONO_FIJO_AVAL = ${telefono_fijo_aval ? `'${telefono_fijo_aval}'` : `NULL`}
      ,TELEFONO_MOVIL_AVAL = '${telefono_movil_aval}'
      ,CORREO_ELECTRONICO_AVAL = ${correo_electronico_aval ? `'${correo_electronico_aval}'` : `NULL`}
      ,CURP_AVAL = '${curp_aval}'
      ,ID_DOMICILIO_AVAL = ${id_domicilio_aval ? id_domicilio_aval : `NULL`}
      ,TIPO_CALLE_AVAL = '${tipo_calle_aval.value}'
      ,NOMBRE_CALLE_AVAL = '${nombre_calle_aval}'
      ,NUMERO_EXTERIOR_AVAL = ${numero_exterior_aval ? `'${numero_exterior_aval}'` : `NULL`}
      ,NUMERO_INTERIOR_AVAL = ${numero_interior_aval ? `'${numero_interior_aval}'` : `NULL`}
      ,COLONIA_AVAL = '${colonia_aval}'
      ,MUNICIPIO_AVAL = '${municipio_aval}'
      ,ESTADO_AVAL = '${estado_aval.value}'
      ,CP_AVAL = '${cp_aval}'
      ,REFERENCIAS_DOM_AVAL = ${referencias_dom_aval ? `'${referencias_dom_aval}'` : `NULL`}
      ,ID_PLAZO = ${id_plazo}
		  ,TASA_DE_INTERES = ${tasa_de_interes} 
		  ,SEMANAS_PLAZO = ${semanas_plazo}
      ,CANTIDAD_PRESTADA = ${cantidad_prestada}
      ,DIA_SEMANA = '${dia_semana}'
      ,FECHA_INICIAL = '${fecha_inicial}'
      ,FECHA_FINAL_ESTIMADA = '${fecha_final_estimada}'
      ,CANTIDAD_PAGAR = ${cantidad_pagar}      
      ,OBSERVACIONES = ${observaciones ? `'${observaciones}'` : `NULL`}
      ,MODIFIED_BY = ${id_usuario}
      ,MODIFIED_DATE = '${current_local_date.toISOString()}'
      ,ID_LOAN_TO_REFINANCE = ${id_loan_to_refinance ? id_loan_to_refinance : `NULL`}

      `;
    } else if (currentLoanRequestStatus === Status.EN_REVISION) {
      updateQueryColumns = `SET 
                        LOAN_REQUEST_STATUS = '${newLoanRequestStatus}' 
                        ,OBSERVACIONES = ${observaciones ? `'${observaciones}'` : `NULL`}
                        `;

      let idClienteGenerado;
      let idPrestamoGenerado;
      let encabezadoPrestamo: LoanHeader;
      let procInsertLoan: GenericBDRequest;

      switch (newLoanRequestStatus) {
        case Status.ACTUALIZAR:
          updateQueryColumns += ` ,MODIFIED_BY = ${id_usuario}
                                  ,MODIFIED_DATE = '${current_local_date.toISOString()}'
                                  ,ID_LOAN_TO_REFINANCE = ${id_loan_to_refinance ? id_loan_to_refinance : `NULL`}                                 
          `;
          break;

        case Status.RECHAZADO:
          updateQueryColumns += ` ,CLOSED_BY = ${id_usuario} 
                                  ,CLOSED_DATE = '${current_local_date.toISOString()}'                                  
                                  `;

          break;

        case Status.APROBADO:
          datosCliente.id_agente = id_agente;
          datosCliente.cliente_activo = 1;

          updateQueryColumns += ` ,CLOSED_BY = ${id_usuario} 
                                  ,CLOSED_DATE = '${current_local_date.toISOString()}'
                                  `;

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
            updateQueryColumns += `,ID_AVAL = ${datosCliente.id_aval}`;
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

            updateQueryColumns += `,ID_CLIENTE = ${idClienteGenerado}`;
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
              cantidad_refinanciada: cantidad_restante_anterior
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

          updateQueryColumns += `,ID_LOAN = ${idPrestamoGenerado}
                                 ,ID_LOAN_TO_REFINANCE = ${id_loan_to_refinance ? `${id_loan_to_refinance}` : `NULL`}
                                 ,ID_DOMICILIO_CLIENTE = (SELECT ID_DOMICILIO FROM CLIENTES WHERE ID = ${idClienteGenerado})
                                 ,ID_DOMICILIO_AVAL = (SELECT ID_DOMICILIO FROM AVALES WHERE ID_AVAL = ${datosCliente.id_aval})
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
