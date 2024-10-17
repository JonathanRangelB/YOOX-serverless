import { DateTime, Float, Int, Table, VarChar } from 'mssql';

import { DbConnector } from '../../helpers/dbConnector';
import { last_loan_id } from '../../helpers/table-schemas';
import { SPInsertNewLoanRequest } from '../types/SPInsertNewLoanRequest';
import { statusResponse } from '../types/loanRequest';
import { convertToBase36 } from '../../helpers/utils';

export const registerNewLoanRequest = async (
  spInsertNewLoanRequest: SPInsertNewLoanRequest
): Promise<statusResponse> => {
  let message = '';
  const pool = await DbConnector.getInstance().connection;
  const procTransaction = pool.transaction();

  try {
    await procTransaction.begin();

    const nextIdQuery = await procTransaction
      .request()
      .query<last_loan_id>(
        'SELECT ISNULL(MAX(ID), 0) AS LAST_LOAN_ID, GETDATE() AS CURRENT_DATE_SERVER FROM LOAN_REQUEST;'
      );

    spInsertNewLoanRequest.id = nextIdQuery.recordset[0].LAST_LOAN_ID + 1;
    spInsertNewLoanRequest.created_date =
      nextIdQuery.recordset[0].CURRENT_DATE_SERVER;
    spInsertNewLoanRequest.request_number = convertToBase36(
      spInsertNewLoanRequest.id
    );
    spInsertNewLoanRequest.loan_request_status = 'EN REVISION';

    const tableNewRequestLoan = new Table('LOAN_REQUEST');
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
    tableNewRequestLoan.columns.add('MODIFIED_DATE', DateTime, {
      nullable: true,
    });
    tableNewRequestLoan.columns.add('CLOSED_BY', Int, { nullable: true });
    tableNewRequestLoan.columns.add('CLOSED_DATE', DateTime, {
      nullable: true,
    });
    tableNewRequestLoan.columns.add('STATUS_CODE', Int, { nullable: true });

    tableNewRequestLoan.rows.add(
      spInsertNewLoanRequest.id,
      spInsertNewLoanRequest.request_number,
      spInsertNewLoanRequest.loan_request_status,
      spInsertNewLoanRequest.id_agente,
      spInsertNewLoanRequest.id_grupo_original,
      spInsertNewLoanRequest.id_cliente,
      spInsertNewLoanRequest.nombre_cliente,
      spInsertNewLoanRequest.apellido_paterno_cliente,
      spInsertNewLoanRequest.apellido_materno_cliente,
      spInsertNewLoanRequest.telefono_fijo,
      spInsertNewLoanRequest.telefono_movil,
      spInsertNewLoanRequest.correo_electronico,
      spInsertNewLoanRequest.ocupacion,
      spInsertNewLoanRequest.curp,
      spInsertNewLoanRequest.tipo_calle,
      spInsertNewLoanRequest.nombre_calle,
      spInsertNewLoanRequest.numero_exterior,
      spInsertNewLoanRequest.numero_interior,
      spInsertNewLoanRequest.colonia,
      spInsertNewLoanRequest.municipio,
      spInsertNewLoanRequest.estado,
      spInsertNewLoanRequest.cp,
      spInsertNewLoanRequest.referencias,
      spInsertNewLoanRequest.id_plazo,
      spInsertNewLoanRequest.cantidad_prestada,
      spInsertNewLoanRequest.dia_semana,
      spInsertNewLoanRequest.fecha_inicial,
      spInsertNewLoanRequest.fecha_final_estimada,
      spInsertNewLoanRequest.cantidad_pagar,
      spInsertNewLoanRequest.tasa_interes,
      spInsertNewLoanRequest.observaciones,
      spInsertNewLoanRequest.created_by,
      spInsertNewLoanRequest.created_date,
      spInsertNewLoanRequest.modified_date,
      spInsertNewLoanRequest.closed_by,
      spInsertNewLoanRequest.closed_date,
      spInsertNewLoanRequest.status_code
    );

    await procTransaction.request().bulk(tableNewRequestLoan);
    await procTransaction.commit();

    message = 'Alta de nuevo requerimiento terminó de manera exitosa';
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
