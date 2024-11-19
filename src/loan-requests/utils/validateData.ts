import { Table } from 'mssql';

import { last_loan_id } from '../../helpers/table-schemas';
import { convertDateTimeZone, convertToBase36 } from '../../helpers/utils';
import { InsertNewLoanRequest } from '../types/SPInsertNewLoanRequest';
import { generateNewLoanRequestTable } from './generateNewLoanRequestTable';
import { DbConnector } from '../../helpers/dbConnector';

export async function validateData(
  newLoanRequest: InsertNewLoanRequest
): Promise<{ tableNewRequestLoan: Table; request_number: string }> {
  const pool = await DbConnector.getInstance().connection;
  const {
    fecha_inicial,
    plazo,
    fecha_final_estimada,
    id_agente,
    id_grupo_original,
    created_by,
  } = newLoanRequest;
  const { id: id_plazo } = plazo;

  const nextIdQuery = pool
    .request()
    .query<last_loan_id>(
      'SELECT ISNULL(MAX(ID), 0) AS LAST_LOAN_ID, GETUTCDATE() AS CURRENT_DATE_SERVER FROM LOAN_REQUEST;'
    );

  const getGenericDataQuery = pool
    .request()
    .query<{ value: number | undefined }>(
      `SELECT ID AS value FROM USUARIOS WHERE ACTIVO = 1 AND ID = ${id_agente}
      SELECT ID AS value FROM USUARIOS WHERE ACTIVO = 1 AND ID = ${created_by}
      SELECT ID_GRUPO AS value FROM GRUPOS_AGENTES WHERE ID_GRUPO = ${id_grupo_original}
      SELECT TASA_DE_INTERES AS value FROM PLAZO WHERE ID = ${id_plazo}`
    );

  const [nextId, getGenericData] = await Promise.all([
    nextIdQuery,
    getGenericDataQuery,
  ]);

  const created_date = nextId.recordset[0].CURRENT_DATE_SERVER;
  const horaLocal = convertDateTimeZone(created_date, 'America/Mexico_City');

  const [idAgente, idUsuario, idGrupo, tasaInteres] =
    getGenericData.recordsets.map(([record]: any) => record?.value);

  if (fecha_inicial > fecha_final_estimada) {
    throw new Error(
      'La fecha inicial no puede ser posterior a la fecha final estimada'
    );
  }

  if (!idAgente) {
    throw new Error('El agente no existe o se encuentra inactivo');
  }

  if (!idUsuario) {
    throw new Error('El usuario no existe o se encuentra inactivo');
  }

  if (!idGrupo) {
    throw new Error('El grupo no existe o el usuario no lo tiene asignado');
  }

  if (!tasaInteres) {
    throw new Error('El plazo seleccionado no existe');
  }

  const id = nextId.recordset[0].LAST_LOAN_ID + 1;
  const request_number = convertToBase36(id);
  const loan_request_status = 'EN REVISION';

  const tableNewRequestLoan = generateNewLoanRequestTable(newLoanRequest, {
    id,
    request_number,
    loan_request_status,
    tasaInteres,
    created_date: horaLocal as Date,
  });

  return { tableNewRequestLoan, request_number };
}
