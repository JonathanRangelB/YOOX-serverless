import { Date, DateTime, Float, Int, PreparedStatement, Table, VarChar } from "mssql";
import { DbConnector } from "../../helpers/dbConnector";
import { loan_update_date } from "../../helpers/table-schemas";
import { SPInsertNewLoanRequest } from "../types/SPInsertNewLoanRequest";
import { statusResponse } from "../types/loanRequest";
import { customer_request, address } from "../../helpers/table-schemas";
import { registerNewCustomer } from "../../customer/transactions/registerNewCustomer";
import { convertToBase36 } from "../../helpers/utils";
import { types } from "util";
import { customer } from "../../customer/schemas/customer.schema";

export const registerNewLoanRequest = async (
  spInsertNewLoanRequest: SPInsertNewLoanRequest,
): Promise<statusResponse> => {
  let message = "";
  const pool = await DbConnector.getInstance().connection;
  const procTransaction = pool.transaction();

  try {
    await procTransaction.begin();

    const queryResult = await procTransaction
      .request()
      .input('ID_LOAN_REQUEST', Int, spInsertNewLoanRequest.id)
      .query<loan_update_date>(
        `SELECT ID, REQUEST_NUMBER, LOAN_REQUEST_STATUS, GETDATE() AS CURRENT_DATE_SERVER
        FROM LOAN_REQUEST
        WHERE ID = @ID_LOAN_REQUEST;`
      );

console.log(`Concurrencia: ${queryResult.rowsAffected.length}`)
console.table(queryResult.recordsets[0][0])


    //Manejo de concurrencia
    if (!queryResult.recordsets[0][0]) {
      await procTransaction.rollback()
      message = `El registro no existe`
      return { message }
    }

    const currentLoanRequestStatus = queryResult.recordsets[0][0].LOAN_REQUEST_STATUS

    if (currentLoanRequestStatus === `APROBADO` || currentLoanRequestStatus === `RECHAZADO`) {
      await procTransaction.rollback()
      message = `La solicitud ya fue cerrada con estatus ${currentLoanRequestStatus}`
      return { message }
    }

    const {
      id: id_loan_request,
      loan_request_status: newLoanRequestStatus,
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
      closed_by

    } = spInsertNewLoanRequest


    //Comienza ensamblado de la cadena del query

    let updateQueryColumns = ``

    if (currentLoanRequestStatus === `ACTUALIZAR` && newLoanRequestStatus === `EN REVISION`) {
      updateQueryColumns = `SET LOAN_REQUEST_STATUS = '${newLoanRequestStatus}'
      ,NOMBRE_CLIENTE = '${nombre_cliente}'
      ,APELLIDO_PATERNO_CLIENTE = '${apellido_paterno_cliente}'
      ,APELLIDO_MATERNO_CLIENTE = '${apellido_materno_cliente}'
      ,TELEFONO_FIJO = '${telefono_fijo}'
      ,TELEFONO_MOVIL = '${telefono_movil}'
      ,CORREO_ELECTRONICO = '${correo_electronico}'
      ,OCUPACION = ${ocupacion ? "'" + ocupacion + "'" : 'NULL'}
      ,CURP = '${curp}'
      ,TIPO_CALLE = '${tipo_calle}' 
      ,NOMBRE_CALLE = '${nombre_calle}' 
      ,NUMERO_EXTERIOR = '${numero_exterior}' 
      ,NUMERO_INTERIOR = '${numero_interior}' 
      ,COLONIA = '${colonia}' 
      ,MUNICIPIO = '${municipio}' 
      ,ESTADO = '${estado}' 
      ,CP = '${cp}'
      ,REFERENCIAS = ${referencias ? "'" + referencias + "'" : 'NULL'}
      ,ID_PLAZO = ${id_plazo}
      ,CANTIDAD_PRESTADA = ${cantidad_prestada}
      ,DIA_SEMANA = '${dia_semana}'
      ,FECHA_INICIAL = '${fecha_inicial}'
      ,FECHA_FINAL_ESTIMADA = '${fecha_final_estimada}'
      ,CANTIDAD_PAGAR = ${cantidad_pagar}
      ,TASA_INTERES = ${tasa_interes}
      ,OBSERVACIONES = ${observaciones ? "'" + observaciones + "'" : 'NULL'}
      ,MODIFIED_DATE = @MOD_DT
      `
    }

    if (currentLoanRequestStatus === `EN REVISION`) {

      switch (newLoanRequestStatus) {

        case `ACTUALIZAR`:
          updateQueryColumns = `SET LOAN_REQUEST_STATUS = '${newLoanRequestStatus}' `
          break;

        case `APROBADO`:
          updateQueryColumns = `SET LOAN_REQUEST_STATUS = '${newLoanRequestStatus}'
          ,CLOSED_BY = ${closed_by}
          ,CLOSED_DATE = GETDATE()
          `
          if(spInsertNewLoanRequest.id_cliente) {
            const objCustomer : customer_request = {
              id: 0,
              nombre: `${spInsertNewLoanRequest.nombre_cliente} ${spInsertNewLoanRequest.apellido_paterno_cliente} ${spInsertNewLoanRequest.apellido_materno_cliente}` ,
              telefono_fijo: spInsertNewLoanRequest.telefono_fijo,
              telefono_movil: spInsertNewLoanRequest.telefono_movil,
              correo_electronico: spInsertNewLoanRequest.correo_electronico,
              activo: 1,
              clasificacion: ``,
              observaciones: ``,
              id_agente: spInsertNewLoanRequest.id_agente,
              ocupacion: ``,
              curp: spInsertNewLoanRequest.curp,
              id_domicilio: 0
            }

            const objAddress : address = {
              id: 0,
              tipo_calle: spInsertNewLoanRequest.tipo_calle,
              nombre_calle: spInsertNewLoanRequest.nombre_calle,
              numero_exterior: spInsertNewLoanRequest.numero_exterior,
              numero_interior: spInsertNewLoanRequest.numero_interior,
              colonia: spInsertNewLoanRequest.colonia,
              municipio: spInsertNewLoanRequest.municipio,
              estado: spInsertNewLoanRequest.estado,
              cp: spInsertNewLoanRequest.cp,
              referencias: spInsertNewLoanRequest.referencias,
              created_by_usr: spInsertNewLoanRequest.created_by,
              created_date: queryResult.recordsets[0][0].CURRENT_DATE_SERVER,
              modified_by_usr: 0,
              modified_date: queryResult.recordsets[0][0].CURRENT_DATE_SERVER
            }

            const procNewCustomer = await registerNewCustomer(objCustomer, objAddress, procTransaction)
            
            console.table(objCustomer)
            console.table(objAddress)



          }

        case `RECHAZADO`:
          updateQueryColumns = `SET LOAN_REQUEST_STATUS = '${newLoanRequestStatus}'
                                ,CLOSED_BY = ${closed_by}
                                ,CLOSED_DATE = GETDATE()
                              `
          break;

        default: (message = `Cambio de status incorrecto`, procTransaction.rollback())
      }
    }

    let updateQueryString = `UPDATE LOAN_REQUEST
                            
                            ${updateQueryColumns}
                            
                            WHERE ID = @IID;`

    console.log(`====================== Query statement ==========================`)
    console.log(updateQueryString)
    console.log(`=================================================================`)

    const reqUpdate = procTransaction.request()
    reqUpdate.input('IID', id_loan_request)

    if ((await reqUpdate.query(updateQueryString)).rowsAffected.length) {
      await procTransaction.commit()
      message = `Requerimiento de préstamo actualizado`
    } else {
      await procTransaction.rollback()
      message = `No se actualizó`
    }

    return { message };
  } catch (error) {
    await procTransaction.rollback();
    let message = "";
    let errorMessage = "";

    if (error instanceof Error) {
      message = `Error durante la transacción`;
      errorMessage = error.message as string;
    }
    console.log({ message, error });
    return { message, error: errorMessage };
  }
};
