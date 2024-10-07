import { Int } from 'mssql';

import { DbConnector } from '../../helpers/dbConnector';
import { loan_update_date } from '../../helpers/table-schemas';
import { SPInsertNewLoanRequest } from '../types/SPInsertNewLoanRequest';
import { statusResponse } from '../types/loanRequest';
import { customer_request, address } from '../../helpers/table-schemas';
import { registerNewCustomer } from '../../customer/transactions/registerNewCustomer';

export const registerNewLoanRequest = async (
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
        'SELECT ID, REQUEST_NUMBER, LOAN_REQUEST_STATUS, GETDATE() AS CURRENT_DATE_SERVER FROM LOAN_REQUEST WHERE ID = @ID_LOAN_REQUEST;'
      );

    console.log(`Concurrencia: ${queryResult.rowsAffected.length}`);
    console.table(queryResult.recordset[0]);

    // WARN: falso positivo, los objetos vacios son thruty y no deberia ser usado asi en el if
    // Manejo de concurrencia
    if (!queryResult.recordset[0]) {
      await procTransaction.rollback();
      return { message: 'El registro no existe' };
    }

    const currentLoanRequestStatus =
      queryResult.recordset[0].LOAN_REQUEST_STATUS;

    if (
      // TODO: puede ser refactorizado a: ['APROBADO', 'RECHAZADO'].includes(currentLoanRequestStatus)
      // lo hace menos verboso y facil de leer
      currentLoanRequestStatus === `APROBADO` ||
      currentLoanRequestStatus === `RECHAZADO`
    ) {
      await procTransaction.rollback();
      return {
        message: `La solicitud ya fue cerrada con el status ${currentLoanRequestStatus}`,
      };
    }

    // TODO: extrayendo todo en variables, al final del desarollo eliminar las que no se utilicen
    const {
      id: id_loan_request,
      request_number,
      loan_request_status: newLoanRequestStatus,
      id_agente,
      id_grupo_original,
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
      created_by,
      created_date,
      modified_date,
      closed_by,
      closed_date,
      status_code,
    } = spInsertNewLoanRequest;

    //Comienza ensamblado de la cadena del query
    let updateQueryColumns = '';

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
      ,MODIFIED_DATE = @MOD_DT`; // TODO: revisar que es @MOD_DT, quiza aun no fue implementado, no mezclar tecnicas de creacion de strings para los querys
    }

    if (currentLoanRequestStatus === `EN REVISION`) {
      switch (newLoanRequestStatus) {
        case 'ACTUALIZAR':
          // TODO: se requiere concatenar? en ese caso usar +=
          updateQueryColumns = `SET LOAN_REQUEST_STATUS = '${newLoanRequestStatus}' `;
          break;

        case 'APROBADO':
          // TODO: se requiere concatenar? en ese caso usar +=
          updateQueryColumns = `SET LOAN_REQUEST_STATUS = '${newLoanRequestStatus}'
          ,CLOSED_BY = ${closed_by}
          ,CLOSED_DATE = GETDATE()`;

          if (id_cliente) {
            const objCustomer: customer_request = {
              id: 0,
              nombre: `${nombre_cliente} ${apellido_paterno_cliente} ${apellido_materno_cliente}`,
              telefono_fijo,
              telefono_movil,
              correo_electronico,
              activo: 1,
              clasificacion: '',
              observaciones: '',
              id_agente,
              ocupacion: '',
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
              referencias,
              created_by_usr: created_by,
              created_date: queryResult.recordset[0].CURRENT_DATE_SERVER,
              modified_by_usr: 0,
              modified_date: queryResult.recordset[0].CURRENT_DATE_SERVER,
            };

            // TODO: variable aun no utilizada
            const procNewCustomer = await registerNewCustomer(
              objCustomer,
              objAddress,
              procTransaction
            );

            console.table(objCustomer);
            console.table(objAddress);
          }

        case 'RECHAZADO':
          updateQueryColumns = `SET LOAN_REQUEST_STATUS = '${newLoanRequestStatus}' ,CLOSED_BY = ${closed_by} ,CLOSED_DATE = GETDATE()`;
          break;

        default:
          // TODO: esta linea causa conflicto, no se entiende bien lo que se quiere hacer aquí
          (message = `Cambio de status incorrecto`), procTransaction.rollback();
      }
    }

    // TODO: igual que la linea 124, no mezclar las tecnicas de creacion de strings para los querys
    let updateQueryString = `UPDATE LOAN_REQUEST ${updateQueryColumns} WHERE ID = @IID;`;

    console.log('=================== Query statement =======================');
    console.log(updateQueryString);
    console.log('===========================================================');

    const reqUpdate = procTransaction.request();
    reqUpdate.input('IID', id_loan_request);

    const updateResult = await reqUpdate.query(updateQueryString);

    if (!updateResult.rowsAffected.length) {
      await procTransaction.rollback();
      message = 'No se actualizó el registro';
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
    console.log({ message, error });
    return { message, error: errorMessage };
  }
};
