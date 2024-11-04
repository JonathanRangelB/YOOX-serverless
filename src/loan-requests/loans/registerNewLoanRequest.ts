import { DateTime, Float, Int, Table, VarChar } from 'mssql';
import { DbConnector } from '../../helpers/dbConnector';
import { last_loan_id } from '../../helpers/table-schemas';
import { SPInsertNewLoanRequest } from '../types/SPInsertNewLoanRequest';
import { statusResponse } from '../types/loanRequest';
import { convertToBase36, convertDateTimeZone } from '../../helpers/utils';

export const registerNewLoanRequest = async (
  spInsertNewLoanRequest: SPInsertNewLoanRequest
): Promise<statusResponse> => {
  let message = '';
  let validData = true
  const pool = await DbConnector.getInstance().connection;
  const procTransaction = pool.transaction();

  try {

const {
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
  //tasa_interes,
  observaciones,
  created_by,
  status_code
} = spInsertNewLoanRequest;

    await procTransaction.begin();

    const nextIdQuery = await procTransaction
      .request()
      .query<last_loan_id>(
        'SELECT ISNULL(MAX(ID), 0) AS LAST_LOAN_ID, GETDATE() AS CURRENT_DATE_SERVER FROM LOAN_REQUEST;'
      );

    const getGenericData = await procTransaction
    .request()
    .query<{value: number | null}>(
      `SELECT ID AS value FROM USUARIOS WHERE ACTIVO = 1 AND ID = ${id_agente}
      SELECT ID AS value FROM USUARIOS WHERE ACTIVO = 1 AND ID = ${created_by}
      SELECT ID_GRUPO AS value FROM GRUPOS_AGENTES WHERE ID_GRUPO = ${id_grupo_original}
      SELECT TASA_DE_INTERES AS value FROM PLAZO WHERE ID = ${id_plazo}
      `
    );

    const created_date = nextIdQuery.recordset[0].CURRENT_DATE_SERVER;

    convertDateTimeZone(created_date, 'America/Mexico_City')
   
    const [idAgente, idUsuario, idGrupo, tasaInteres] = getGenericData.recordsets.map(([record]) => record?.value)

    if(  fecha_inicial > fecha_final_estimada) {
      validData = false
      message += `La fecha inicial no puede ser posterior a la fecha final estimada
      `
    }

    if(!idAgente){
      validData = false
      message += `EL agente no existe o se encuentra inactivo
      `
    }

    if(!idUsuario) {
      validData = false
      message += `EL usuario no existe o se encuentra inactivo
      `
    }

    if(!idGrupo) {
      validData = false
      message += `EL grupo no existe`      
    }
    
    if(!tasaInteres) {
      validData = false
      message += `EL plazo seleccionado no existe`      
    }

    if(!validData) {
      await procTransaction.rollback()
      return {message}
    }

    const id = nextIdQuery.recordset[0].LAST_LOAN_ID + 1;

    const request_number = convertToBase36(
      id
    );
    const loan_request_status = 'EN REVISION';
    let tableNewRequestLoan = new Table('LOAN_REQUEST');

    tableNewRequestLoan.create = false;

    tableNewRequestLoan.columns.add('ID', Int, { nullable: false });
    tableNewRequestLoan.columns.add('REQUEST_NUMBER', VarChar, {
      nullable: false,
    });
    tableNewRequestLoan.columns.add('LOAN_REQUEST_STATUS', VarChar, {
      nullable: false,
    });
    tableNewRequestLoan.columns.add('ID_AGENTE', Int, { nullable: true });
    tableNewRequestLoan.columns.add('ID_GRUPO_ORIGINAL', Int, {
      nullable: true,
    });
    tableNewRequestLoan.columns.add('ID_CLIENTE', Int, { nullable: true });
    tableNewRequestLoan.columns.add('NOMBRE_CLIENTE', VarChar, {
      nullable: false,
    });
    tableNewRequestLoan.columns.add('APELLIDO_PATERNO_CLIENTE', VarChar, {
      nullable: false,
    });
    tableNewRequestLoan.columns.add('APELLIDO_MATERNO_CLIENTE', VarChar, {
      nullable: false,
    });
    tableNewRequestLoan.columns.add('TELEFONO_FIJO', VarChar, {
      nullable: true,
    });
    tableNewRequestLoan.columns.add('TELEFONO_MOVIL', VarChar, {
      nullable: true,
    });
    tableNewRequestLoan.columns.add('CORREO_ELECTRONICO', VarChar, {
      nullable: true,
    });
    tableNewRequestLoan.columns.add('OCUPACION', VarChar, { nullable: true });
    tableNewRequestLoan.columns.add('CURP', VarChar, { nullable: false });
    tableNewRequestLoan.columns.add('TIPO_CALLE', VarChar, { nullable: true });
    tableNewRequestLoan.columns.add('NOMBRE_CALLE', VarChar, {
      nullable: true,
    });
    tableNewRequestLoan.columns.add('NUMERO_EXTERIOR', VarChar, {
      nullable: true,
    });
    tableNewRequestLoan.columns.add('NUMERO_INTERIOR', VarChar, {
      nullable: true,
    });
    tableNewRequestLoan.columns.add('COLONIA', VarChar, { nullable: true });
    tableNewRequestLoan.columns.add('MUNICIPIO', VarChar, { nullable: true });
    tableNewRequestLoan.columns.add('ESTADO', VarChar, { nullable: true });
    tableNewRequestLoan.columns.add('CP', VarChar, { nullable: true });
    tableNewRequestLoan.columns.add('REFERENCIAS', VarChar, { nullable: true });
    tableNewRequestLoan.columns.add('ID_PLAZO', Int, { nullable: false });
    tableNewRequestLoan.columns.add('CANTIDAD_PRESTADA', Float, {
      nullable: false,
    });
    tableNewRequestLoan.columns.add('DIA_SEMANA', VarChar, { nullable: false });
    tableNewRequestLoan.columns.add('FECHA_INICIAL', DateTime, {
      nullable: false,
    });
    tableNewRequestLoan.columns.add('FECHA_FINAL_ESTIMADA', DateTime, {
      nullable: false,
    });
    tableNewRequestLoan.columns.add('CANTIDAD_PAGAR', Float, {
      nullable: true,
    });
    tableNewRequestLoan.columns.add('TASA_INTERES', Int, { nullable: true });
    tableNewRequestLoan.columns.add('OBSERVACIONES', VarChar, {
      nullable: true,
    });
    tableNewRequestLoan.columns.add('CREATED_BY', Int, { nullable: false });
    tableNewRequestLoan.columns.add('CREATED_DATE', DateTime, {
      nullable: false,
    });

    tableNewRequestLoan.columns.add('STATUS_CODE', Int, { nullable: true });

    tableNewRequestLoan.rows.add(
      id,
      request_number,
      loan_request_status,
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
      tasaInteres,
      observaciones,
      created_by,
      created_date,
      status_code
    );

    await procTransaction.request().bulk(tableNewRequestLoan);
    await procTransaction.commit();

    message = 'Alta de nuevo requerimiento terminó de manera exitosa';
    return { message, customerFolderName: `${request_number}-${apellido_paterno_cliente}`  };
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
