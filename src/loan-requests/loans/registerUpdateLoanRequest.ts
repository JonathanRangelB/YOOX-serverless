import { Int } from 'mssql';
import { DbConnector } from '../../helpers/dbConnector';
import { loan_update_date } from '../../helpers/table-schemas';
import { UpdateLoanRequest } from '../types/SPInsertNewLoanRequest';
import { updateStatusResponse } from '../types/loanRequest';
import { registerNewCustomer } from '../../general-data-requests/transactions/customer/registerNewCustomer';
import { convertDateTimeZone } from '../../helpers/utils';
import { updateCustomer } from '../../general-data-requests/transactions/customer/updateCustomer';
import { registerNewEndorsement } from '../../general-data-requests/transactions/endorsement/registerNewEndorsement';
import { updateEndorsement } from '../../general-data-requests/transactions/endorsement/updateEndorsement';

export const registerUpdateLoanRequest = async (
  updateLoanRequest: UpdateLoanRequest
): Promise<updateStatusResponse> => {
  const pool = await DbConnector.getInstance().connection;
  const procTransaction = pool.transaction();

  try {
    await procTransaction.begin();
    const queryResult = await procTransaction
      .request()
      .input('ID_LOAN_REQUEST', Int, updateLoanRequest.id)
      .query<loan_update_date>(
        'SELECT id as [loan_id], request_number, loan_request_status, GETUTCDATE() as [current_date_server] FROM LOAN_REQUEST WHERE ID = @ID_LOAN_REQUEST;'
      );

    const serverTime = queryResult.recordset[0].current_date_server;
    const current_local_date = (convertDateTimeZone(serverTime, 'America/Mexico_City')) as Date
    console.log(`Fecha y hora local:  ${(current_local_date.toISOString())}`);
    // Manejo de concurrencia

    if (!queryResult.recordset[0]) {
      await procTransaction.rollback();
      throw new Error('El registro no existe');
    }

    const currentLoanRequestStatus =
      queryResult.recordset[0].loan_request_status;

    if (['APROBADO', 'RECHAZADO'].includes(currentLoanRequestStatus)) {
      await procTransaction.rollback();
      throw new Error(
        `La solicitud ya ha sido cerrada con el estatus ${currentLoanRequestStatus}`
      );
    }

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
      formCustomer: datosCliente,
      formEndorsement: datosAval,
      id_usuario,
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
    } = datosCliente

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
    } = datosAval

    const {
      id: id_plazo,
      tasa_de_interes,
      semanas_plazo,
      semanas_refinancia,
    } = datosPlazo

    //Comienza ensamblado de la cadena del query
    let updateQueryColumns = '';

    if (currentLoanRequestStatus === newLoanRequestStatus) {
      procTransaction.rollback();
      throw new Error('Cambio de status incorrecto');
    }

    if (
      currentLoanRequestStatus === 'ACTUALIZAR' &&
      newLoanRequestStatus === 'EN REVISION'
    ) {
      updateQueryColumns = `SET 
      LOAN_REQUEST_STATUS = '${newLoanRequestStatus}'
      ,ID_AGENTE = ${id_agente}
      ,ID_GRUPO_ORIGINAL = ${id_grupo_original}
      
      ,ID_CLIENTE = ${id_cliente ? id_cliente : 'NULL'}
      ,NOMBRE_CLIENTE = '${nombre_cliente}'
      ,APELLIDO_PATERNO_CLIENTE = '${apellido_paterno_cliente}'
      ,APELLIDO_MATERNO_CLIENTE = '${apellido_materno_cliente}'    
      ,TELEFONO_FIJO_CLIENTE = '${telefono_fijo_cliente}'
      ,TELEFONO_MOVIL_CLIENTE = '${telefono_movil_cliente}'
      ,CORREO_ELECTRONICO_CLIENTE = '${correo_electronico_cliente ? correo_electronico_cliente : 'NULL'}'
      ,OCUPACION_CLIENTE = ${ocupacion_cliente ? `'${ocupacion_cliente}'` : 'NULL'}
      ,CURP_CLIENTE = '${curp_cliente}'
      ,TIPO_CALLE_CLIENTE = '${tipo_calle_cliente}' 
      ,NOMBRE_CALLE_CLIENTE = '${nombre_calle_cliente}' 
      ,NUMERO_EXTERIOR_CLIENTE = '${numero_exterior_cliente}' 
      ,NUMERO_INTERIOR_CLIENTE = '${numero_interior_cliente}' 
      ,COLONIA_CLIENTE = '${colonia_cliente}' 
      ,MUNICIPIO_CLIENTE = '${municipio_cliente}' 
      ,ESTADO_CLIENTE = '${estado_cliente}' 
      ,CP_CLIENTE = '${cp_cliente}'
      ,REFERENCIAS_DOM_CLIENTE = ${referencias_dom_cliente ? `'${referencias_dom_cliente}'` : 'NULL'}

      ,ID_AVAL = ${id_aval ? id_aval : 'NULL'}
      ,NOMBRE_AVAL = '${nombre_aval}'
      ,APELLIDO_PATERNO_AVAL = '${apellido_paterno_aval}'
      ,APELLIDO_MATERNO_AVAL = '${apellido_materno_aval}'
      ,TELEFONO_FIJO_AVAL = '${telefono_fijo_aval}'
      ,TELEFONO_MOVIL_AVAL = '${telefono_movil_aval}'
      ,CORREO_ELECTRONICO_AVAL = '${correo_electronico_aval ? correo_electronico_aval : 'NULL'}'
      ,CURP_AVAL = '${curp_aval}'
      ,TIPO_CALLE_AVAL = '${tipo_calle_aval}'
      ,NOMBRE_CALLE_AVAL = '${nombre_calle_aval}'
      ,NUMERO_EXTERIOR_AVAL = '${numero_exterior_aval}'
      ,NUMERO_INTERIOR_AVAL = '${numero_interior_aval}'
      ,COLONIA_AVAL = '${colonia_aval}'
      ,MUNICIPIO_AVAL = '${municipio_aval}'
      ,ESTADO_AVAL = '${estado_aval}'
      ,CP_AVAL = '${cp_aval}'
      ,REFERENCIAS_DOM_AVAL = '${referencias_dom_aval ? referencias_dom_aval : 'NULL'}'

      ,ID_PLAZO = ${id_plazo}
      ,CANTIDAD_PRESTADA = ${cantidad_prestada}
      ,DIA_SEMANA = '${dia_semana}'
      ,FECHA_INICIAL = '${fecha_inicial}'
      ,FECHA_FINAL_ESTIMADA = '${fecha_final_estimada}'
      ,CANTIDAD_PAGAR = ${cantidad_pagar}
      ,TASA_INTERES = ${tasa_de_interes}
      ,OBSERVACIONES = ${observaciones ? `'${observaciones}'` : 'NULL'}
      ,MODIFIED_BY = ${id_usuario}
      ,MODIFIED_DATE = ${current_local_date.toISOString()}
      `;
    }

    if (currentLoanRequestStatus === `EN REVISION`) {
      switch (newLoanRequestStatus) {
        case 'ACTUALIZAR':
          updateQueryColumns = `SET LOAN_REQUEST_STATUS = '${newLoanRequestStatus}' `;
          break;

        case 'APROBADO':
          console.log('Entra a caso APROBADO');
          datosCliente.id_agente = id_agente
          datosCliente.cliente_activo = 1

          updateQueryColumns = `SET LOAN_REQUEST_STATUS = '${newLoanRequestStatus}'          
          `

          if (!id_cliente) {
            datosCliente.cliente_creado_por = id_usuario
            datosCliente.fecha_creacion_cliente = current_local_date
            datosCliente.observaciones_cliente = `Solicitud de préstamo ${request_number}`

            const procNewCustomer = await registerNewCustomer(
              datosCliente,
              procTransaction
            );

            if (!procNewCustomer.idCustomer) {
              procTransaction.rollback();
              throw new Error(procNewCustomer.message);
            }

            updateQueryColumns += `,ID_CLIENTE = ${procNewCustomer.idCustomer}`

          } else {
            datosCliente.cliente_modificado_por = id_usuario
            datosCliente.fecha_modificacion_cliente = current_local_date
            console.log(`fecha_modificacion_cliente: ${datosCliente.fecha_modificacion_cliente}`)
            const procUpdateCustomer = await updateCustomer(datosCliente, procTransaction);
            console.log('id generado para actualizar cliente: ', procUpdateCustomer.generatedId)
            if (!procUpdateCustomer.generatedId) {
              procTransaction.rollback();
              throw new Error(procUpdateCustomer.message);
            }
          }

          if (!id_aval) {
            datosAval.aval_creado_por = id_usuario
            datosAval.fecha_creacion_aval = current_local_date
            datosAval.observaciones_aval = `Solicitud de préstamo ${request_number}`

            const procNewEndorsement = await registerNewEndorsement(datosAval, procTransaction)

            if (!procNewEndorsement.idEndorsment) {
              procTransaction.rollback();
              throw new Error(procNewEndorsement.message)
            }

          }
          else {
            datosAval.aval_modificado_por = id_usuario
            datosAval.fecha_modificacion_aval = current_local_date

            const procNewEndorsement = await updateEndorsement(datosAval, procTransaction)
            console.log('id generado para actualizar aval: ', procNewEndorsement.generatedId)
            if (!procNewEndorsement.generatedId) {
              procTransaction.rollback();
              throw new Error(procNewEndorsement.message)
            }
          }

          updateQueryColumns += `
          ,CLOSED_BY = ${id_usuario}
          ,CLOSED_DATE = '${current_local_date.toISOString()}' `;

          break;

        case 'RECHAZADO':
          updateQueryColumns = `SET LOAN_REQUEST_STATUS = '${newLoanRequestStatus}' ,CLOSED_BY = ${id_usuario} ,CLOSED_DATE = '${current_local_date.toISOString()}' `;
          break;

        default:
          procTransaction.rollback();
          throw new Error('Cambio de status incorrecto');
      }
    }

    const updateQueryString = `UPDATE LOAN_REQUEST ${updateQueryColumns} WHERE ID = ${id_loan_request};`;
    console.log(`Query de actualización: ${updateQueryString}`);
    const updateResult = await procTransaction.request().query(updateQueryString);
    //const updateResult = await requestUpdate.query(updateQueryString);

    if (!updateResult.rowsAffected[0]) {
      await procTransaction.rollback();
      throw new Error('No se actualizó el registro');
    }

    await procTransaction.commit();
    return {
      message: 'Requerimiento de préstamo actualizado',
    };
  } catch (error) {
    await procTransaction.rollback();
    let errorMessage = '';

    if (error instanceof Error) {
      errorMessage = error.message as string;
    }

    return { error: errorMessage };
  }
};
