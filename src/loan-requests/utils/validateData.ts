import { Table, Transaction } from 'mssql';
import { last_loan_id } from '../../helpers/table-schemas';
import { convertDateTimeZone, convertToBase36 } from '../../helpers/utils';
import { InsertNewLoanRequest } from '../types/SPInsertNewLoanRequest';
import { generateNewLoanRequestTable } from './generateNewLoanRequestTable';
import { searchTelefonoQuery } from '../../validators/utils/querySearchData';
import { UpdateLoanRequest } from '../types/SPInsertNewLoanRequest';

export async function validateData(
  newLoanRequest: InsertNewLoanRequest,
  procTransaction: Transaction
): Promise<{ tableNewRequestLoan: Table; request_number: string }> {
  const {
    fecha_inicial,
    plazo,
    fecha_final_estimada,
    id_agente,
    id_grupo_original,
    created_by,
    formCliente,
    formAval,
    user_role,
  } = newLoanRequest;
  const { id: id_plazo } = plazo;

  const queryToValidateData = queryValidateData(
    id_agente,
    created_by,
    id_grupo_original,
    id_plazo,
    formCliente.id_cliente,
    formAval.id_aval,
    formCliente.curp_cliente,
    formAval.curp_aval,
    formCliente.telefono_fijo_cliente,
    formCliente.telefono_movil_cliente,
    formAval.telefono_fijo_aval,
    formAval.telefono_movil_aval,
    user_role
  );

  const getGenericData = await procTransaction
    .request()
    .query<{ value: number | undefined }>(`${queryToValidateData}`);
  const nextId = await procTransaction
    .request()
    .query<last_loan_id>(
      'SELECT ISNULL(MAX(ID), 0) AS LAST_LOAN_ID, GETUTCDATE() AS CURRENT_DATE_SERVER FROM LOAN_REQUEST;'
    );

  const createdDate = nextId.recordset[0].CURRENT_DATE_SERVER;
  const horaLocal = convertDateTimeZone(createdDate, 'America/Mexico_City');
  const [
    idAgente,
    idUsuario,
    idGrupo,
    tasaInteres,
    idClienteCurp,
    idAvalCurp,
    idClienteTelefono,
    idAvalTelefono,
    rolDeUsuario,
  ] = getGenericData.recordsets.map(([record]: any) => record?.value);

  const resultValidation = validateDataResult(
    fecha_inicial,
    fecha_final_estimada,
    idAgente,
    idUsuario,
    idGrupo,
    tasaInteres,
    rolDeUsuario
  );

  if (!resultValidation.result) {
    throw new Error(resultValidation.message);
  }

  const id = nextId.recordset[0].LAST_LOAN_ID + 1;
  const request_number = convertToBase36(id);
  const loan_request_status = 'EN REVISION';

  const tableNewRequestLoan = generateNewLoanRequestTable(newLoanRequest, {
    id,
    request_number,
    loan_request_status,
    created_date: horaLocal as Date,
  });

  return { tableNewRequestLoan, request_number };
}

export async function validateDataLoanRequestUpdate(
  updateLoanRequest: UpdateLoanRequest,
  procTransaction: Transaction
): Promise<{
  validationResult: boolean;
  idClienteCurp: number;
  idAvalCurp: number;
  idClienteTelefono: number;
  idAvalTelefono: number;
}> {
  const {
    id_agente,
    id_grupo_original,
    fecha_inicial,
    fecha_final_estimada,
    plazo,
    formCliente,
    formAval,
    modified_by,
    user_role,
  } = updateLoanRequest;

  const queryToValidateData = queryValidateData(
    id_agente,
    modified_by,
    id_grupo_original,
    plazo.id,
    formCliente.id_cliente,
    formAval.id_aval,
    formCliente.curp_cliente,
    formAval.curp_aval,
    formCliente.telefono_fijo_cliente,
    formCliente.telefono_movil_cliente,
    formAval.telefono_fijo_aval,
    formAval.telefono_movil_aval,
    user_role
  );

  const [getGenericData] = await Promise.all([
    procTransaction
      .request()
      .query<{ value: number | undefined }>(`${queryToValidateData}`),
  ]);

  const [
    idAgente,
    idUsuario,
    idGrupo,
    tasaInteres,
    idClienteCurp,
    idAvalCurp,
    idClienteTelefono,
    idAvalTelefono,
    rolDeUsuario,
  ] = getGenericData.recordsets.map(([record]: any) => record?.value);

  const resultValidation = validateDataResult(
    fecha_inicial,
    fecha_final_estimada,
    idAgente,
    idUsuario,
    idGrupo,
    tasaInteres,
    rolDeUsuario
  );

  if (!resultValidation.result) {
    throw new Error(resultValidation.message);
  }

  return {
    validationResult: true,
    idClienteCurp,
    idAvalCurp,
    idClienteTelefono,
    idAvalTelefono,
  };
}

function queryValidateData(
  id_agente: number,
  user_id: number,
  id_grupo_original: number,
  id_plazo: number,
  id_cliente: number,
  id_aval: number,
  curp_cliente: string,
  curp_aval: string,
  telefono_fijo_cliente: string,
  telefono_movil_cliente: string,
  telefono_fijo_aval: string,
  telefono_movil_aval: string,
  rol_de_usuario: number
): string {
  const queryTelefonosCliente =
    'SELECT TOP 1 ID AS value FROM CLIENTES ' +
    searchTelefonoQuery(telefono_fijo_cliente, telefono_movil_cliente, '') +
    ` ${id_cliente ? ` AND ID <> ${id_cliente}` : ``}`;
  const queryTelefonosAval =
    'SELECT TOP 1 ID_AVAL AS value FROM AVALES ' +
    searchTelefonoQuery(telefono_fijo_aval, telefono_movil_aval, '') +
    ` ${id_aval ? ` AND ID_AVAL <> ${id_aval}` : ``}`;

  return `SELECT ID AS value FROM USUARIOS WHERE ACTIVO = 1 AND ID = ${id_agente}
              SELECT ID AS value FROM USUARIOS WHERE ACTIVO = 1 AND ID = ${user_id}
              SELECT ID_GRUPO AS value FROM GRUPOS_AGENTES WHERE ACTIVO = 1 AND ID_GRUPO = ${id_grupo_original}
              SELECT TASA_DE_INTERES AS value FROM PLAZO WHERE ID = ${id_plazo}
              SELECT TOP 1 ID AS value FROM CLIENTES WHERE CURP = '${curp_cliente}' ${id_cliente ? ` AND ID <> ${id_cliente}` : ``}
              SELECT TOP 1 ID_AVAL AS value FROM AVALES WHERE CURP = '${curp_aval}' ${id_aval ? ` AND ID_AVAL <> ${id_aval}` : ``}
              ${queryTelefonosCliente}
              ${queryTelefonosAval}
              SELECT ID_ROL AS value FROM SEC_ROLES WHERE DESCRIPCION = '${rol_de_usuario}'`;
}

function validateDataResult(
  fecha_inicial: Date,
  fecha_final_estimada: Date,
  idAgente: number,
  idUsuario: number,
  idGrupo: number,
  tasaInteres: number,
  rolDeUsuario: number
): { result: boolean; message?: string } {
  if (fecha_inicial > fecha_final_estimada) {
    return {
      result: false,
      message:
        'La fecha inicial no puede ser posterior a la fecha final estimada',
    };
  }

  if (!idAgente) {
    return {
      result: false,
      message: 'El agente no existe o se encuentra inactivo',
    };
  }

  if (!idUsuario) {
    return {
      result: false,
      message: 'El usuario no existe o se encuentra inactivo',
    };
  }

  if (!idGrupo) {
    return {
      result: false,
      message:
        'El grupo no existe, está inactivo o el usuario no pertenece a ese grupo',
    };
  }

  if (!tasaInteres) {
    return { result: false, message: 'El plazo seleccionado no existe' };
  }

  if (!rolDeUsuario) {
    return { result: false, message: 'El rol de usuario no existe' };
  }

  return { result: true };
}
