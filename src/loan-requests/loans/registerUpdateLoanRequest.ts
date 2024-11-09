import { Int } from 'mssql';

import { DbConnector } from '../../helpers/dbConnector';
import { loan_update_date } from '../../helpers/table-schemas';
import { SPInsertNewLoanRequest } from '../types/SPInsertNewLoanRequest';
import { statusResponse } from '../types/loanRequest';
import { customer_request, address } from '../../helpers/table-schemas';
import { registerNewCustomer } from '../../customer/transactions/registerNewCustomer';
import { type } from 'os';

export const registerUpdateLoanRequest = async (
  spInsertNewLoanRequest: SPInsertNewLoanRequest
): Promise<statusResponse> => {
  let message = '';
  const pool = await DbConnector.getInstance().connection;
  const procTransaction = pool.transaction();

  try {
    await procTransaction.begin();
    const queryResult = await procTransaction
      .request()
      .input('ID_LOAN_REQUEST', Int, spInsertNewLoanRequest.id)
      .query<loan_update_date>(
        'SELECT id as [loan_id], request_number, loan_request_status, getdate() as [current_date_server] FROM LOAN_REQUEST WHERE ID = @ID_LOAN_REQUEST;'
      );

    console.table(queryResult.recordset);
    const created_date = queryResult.recordset[0].current_date_server

    // Manejo de concurrencia

    if (!queryResult.recordset[0]) {
      await procTransaction.rollback();
      return { message: 'El registro no existe' };
    }

    const currentLoanRequestStatus =
      queryResult.recordset[0].loan_request_status;

    if (['APROBADO', 'RECHAZADO'].includes(currentLoanRequestStatus)) {
      await procTransaction.rollback();
      return {
        message: `La solicitud ya fue cerrada con el status ${currentLoanRequestStatus}`,
      };
    }

    // TODO: extrayendo todo en variables, al final del desarollo eliminar las que no se utilicen
    const {
      id: id_loan_request,
      loan_request_status: newLoanRequestStatus,
      id_agente,
      id_cliente,
      nombre_cliente,
      apellido_paterno_cliente,
      apellido_materno_cliente,
      telefono_fijo,
      telefono_movil,
      correo_electronico,
      ocupacion,
      curp,
      tipo_calle,
      nombre_calle,
      numero_exterior,
      numero_interior,
      colonia,
      municipio,
      estado,
      cp,
      referencias,
      id_plazo,
      cantidad_prestada,
      dia_semana,
      fecha_inicial,
      fecha_final_estimada,
      cantidad_pagar,
      tasa_interes,
      observaciones,
      closed_by,
    } = spInsertNewLoanRequest;

    //Comienza ensamblado de la cadena del query
    let updateQueryColumns = '';

    if(currentLoanRequestStatus === newLoanRequestStatus) {
      message = 'Cambio de status incorrecto'
      procTransaction.rollback()
      return {message}
    }

    if (
      currentLoanRequestStatus === `ACTUALIZAR` &&
      newLoanRequestStatus === `EN REVISION`
    ) {
      updateQueryColumns = `SET LOAN_REQUEST_STATUS = '${newLoanRequestStatus}'
      ,NOMBRE_CLIENTE = '${nombre_cliente}'
      ,APELLIDO_PATERNO_CLIENTE = '${apellido_paterno_cliente}'
      ,APELLIDO_MATERNO_CLIENTE = '${apellido_materno_cliente}'
      ,TELEFONO_FIJO = '${telefono_fijo}'
      ,TELEFONO_MOVIL = '${telefono_movil}'
      ,CORREO_ELECTRONICO = '${correo_electronico}'
      ,OCUPACION = ${ocupacion ? `'${ocupacion}'` : 'NULL'}
      ,CURP = '${curp}'
      ,TIPO_CALLE = '${tipo_calle}' 
      ,NOMBRE_CALLE = '${nombre_calle}' 
      ,NUMERO_EXTERIOR = '${numero_exterior}' 
      ,NUMERO_INTERIOR = '${numero_interior}' 
      ,COLONIA = '${colonia}' 
      ,MUNICIPIO = '${municipio}' 
      ,ESTADO = '${estado}' 
      ,CP = '${cp}'
      ,REFERENCIAS = ${referencias ? `'${referencias}'` : 'NULL'}
      ,ID_PLAZO = ${id_plazo}
      ,CANTIDAD_PRESTADA = ${cantidad_prestada}
      ,DIA_SEMANA = '${dia_semana}'
      ,FECHA_INICIAL = '${fecha_inicial}'
      ,FECHA_FINAL_ESTIMADA = '${fecha_final_estimada}'
      ,CANTIDAD_PAGAR = ${cantidad_pagar}
      ,TASA_INTERES = ${tasa_interes}
      ,OBSERVACIONES = ${observaciones ? `'${observaciones}'` : 'NULL'}
      ,MODIFIED_DATE = GETDATE() 
      `; 
    }

    if (currentLoanRequestStatus === `EN REVISION`) {
      switch (newLoanRequestStatus) {
        case 'ACTUALIZAR':
          
          updateQueryColumns = `SET LOAN_REQUEST_STATUS = '${newLoanRequestStatus}' `;
          break;

        case 'APROBADO':          
          if (!id_cliente) {
            const objCustomer: customer_request = {
              id: 0,
              nombre: `${nombre_cliente} ${apellido_paterno_cliente} ${apellido_materno_cliente}`,
              telefono_fijo,
              telefono_movil,
              correo_electronico,
              activo: 1,
              clasificacion: '',
              observaciones,
              id_agente,
              ocupacion,
              curp,
              id_domicilio: 0,
            };

            const objAddress: address = {
              id: 0,
              tipo_calle,
              nombre_calle,
              numero_exterior,
              numero_interior,
              colonia,
              municipio,
              estado,
              cp,
              referencias: '',
              created_by_usr: id_agente,
              created_date,
              modified_by_usr: 0,
              modified_date: created_date,
            };
       
            const procNewCustomer = await registerNewCustomer(
              objCustomer,
              objAddress,
              procTransaction
            );            

            if(!procNewCustomer.idCustomer) {
              return {message : procNewCustomer.message}
            }

            updateQueryColumns = `SET LOAN_REQUEST_STATUS = '${newLoanRequestStatus}'
            ,ID_CLIENTE = ${procNewCustomer.idCustomer}
            ,CLOSED_BY = ${closed_by}
            ,CLOSED_DATE = GETDATE()`;

          } else {
            updateQueryColumns = `SET LOAN_REQUEST_STATUS = '${newLoanRequestStatus}'
            ,CLOSED_BY = ${closed_by}
            ,CLOSED_DATE = GETDATE()`;
          }

          break;

        case 'RECHAZADO':
          updateQueryColumns = `SET LOAN_REQUEST_STATUS = '${newLoanRequestStatus}' ,CLOSED_BY = ${closed_by} ,CLOSED_DATE = GETDATE()`;
          break;

        default:
          message = 'Cambio de status incorrecto'
          procTransaction.rollback();
          return {message}
      }
    }

    let updateQueryString = `UPDATE LOAN_REQUEST ${updateQueryColumns} WHERE ID = ${id_loan_request};`;

    const requestUpdate = procTransaction.request();
    const updateResult = await requestUpdate.query(updateQueryString);

    if (!updateResult.rowsAffected.length) {
      await procTransaction.rollback();
      message = 'No se actualizó el registro';
      return { message }
    }

    await procTransaction.commit();
    message = 'Requerimiento de préstamo actualizado';
    return { message };

  } catch (error) {
    await procTransaction.rollback();
    let message = '';
    let errorMessage = '';

    if (error instanceof Error) {
      message = 'Error durante la transacción';
      errorMessage = error.message as string;
    }

    return { message, error: errorMessage };
  }
};
