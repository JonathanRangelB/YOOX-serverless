import { Table, Transaction } from 'mssql';
import { last_loan_id } from '../../helpers/table-schemas';
import { convertDateTimeZone, convertToBase36 } from '../../helpers/utils';
import { InsertNewLoanRequest } from '../types/SPInsertNewLoanRequest';
import { generateNewLoanRequestTable } from './generateNewLoanRequestTable';
import { searchTelefonoQuery } from '../../validators/utils/querySearchData';
import { UpdateLoanRequest } from '../types/SPInsertNewLoanRequest';
import { querySearchLoanToRefinance } from '../../general-data-requests/utils/querySearchLoanToRefinance';

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
    id_loan_to_refinance,
    cantidad_prestada
  } = newLoanRequest;
  const { id: id_plazo } = plazo;

  const {
    id_cliente,
    curp_cliente,
    telefono_fijo_cliente,
    telefono_movil_cliente,
    id_domicilio_cliente
  } = formCliente

  const {
    id_aval,
    curp_aval,
    telefono_fijo_aval,
    telefono_movil_aval,
    id_domicilio_aval
  } = formAval

  const queryToValidateData = queryValidateData(
    id_agente,
    created_by,
    id_grupo_original,
    id_plazo,
    id_cliente,
    id_aval,
    curp_cliente,
    curp_aval,
    telefono_fijo_cliente,
    telefono_movil_cliente,
    telefono_fijo_aval,
    telefono_movil_aval,
    user_role,
    id_loan_to_refinance as number,
    id_domicilio_aval,
    id_domicilio_cliente
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
    idRolDeUsuario,
    amountToRefinance,
    idDomicilioCliente,
    idDomicilioAval,
  ] = getGenericData.recordsets.map(([record]: any) => record?.value);

  const resultValidation = validateDataResult(
    fecha_inicial,
    fecha_final_estimada,
    idAgente,
    idUsuario,
    idGrupo,
    tasaInteres,
    idRolDeUsuario,
    id_loan_to_refinance as number,
    amountToRefinance,
    cantidad_prestada,
    id_domicilio_cliente,
    idDomicilioCliente,
    id_domicilio_aval,
    idDomicilioAval,
    idClienteCurp,
    idAvalCurp,
    idClienteTelefono,
    idAvalTelefono,
    id_cliente,
    id_aval,
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
    loan_request_status,
    id_loan_to_refinance,
    cantidad_prestada,
  } = updateLoanRequest;

  const {
    id_cliente,
    curp_cliente,
    telefono_fijo_cliente,
    telefono_movil_cliente,
    id_domicilio_cliente
  } = formCliente

  const {
    id_aval,
    curp_aval,
    telefono_fijo_aval,
    telefono_movil_aval,
    id_domicilio_aval
  } = formAval

  const queryToValidateData = queryValidateData(
    id_agente,
    modified_by,
    id_grupo_original,
    plazo.id,
    id_cliente,
    id_aval,
    curp_cliente,
    curp_aval,
    telefono_fijo_cliente,
    telefono_movil_cliente,
    telefono_fijo_aval,
    telefono_movil_aval,
    user_role,
    id_loan_to_refinance,
    id_domicilio_aval,
    id_domicilio_cliente
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
    idRolDeUsuario,
    amountToRefinance,
    idDomicilioCliente,
    idDomicilioAval,
  ] = getGenericData.recordsets.map(([record]: any) => record?.value);

  const resultValidation = validateDataResult(
    fecha_inicial,
    fecha_final_estimada,
    idAgente,
    idUsuario,
    idGrupo,
    tasaInteres,
    idRolDeUsuario,
    id_loan_to_refinance as number,
    amountToRefinance,
    cantidad_prestada,
    id_domicilio_cliente,
    idDomicilioCliente,
    id_domicilio_aval,
    idDomicilioAval,
    idClienteCurp,
    idAvalCurp,
    idClienteTelefono,
    idAvalTelefono,
    id_cliente,
    id_aval,
  );

  if (!resultValidation.result) {
    throw new Error(resultValidation.message);
  }

  if (
    loan_request_status === 'APROBADO' &&
    id_agente === modified_by &&
    ['Líder de grupo', 'Cobrador'].includes(user_role)
  ) {
    throw new Error(
      'Un usuario con mayor jerarquía debe aprobar esta solicitud'
    );
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
  rol_de_usuario: string,
  id_loan_to_refinance: number,
  id_domicilio_aval: number,
  id_domicilio_cliente: number,
): string {
  const queryTelefonosCliente =
    'SELECT TOP 1 ID AS value FROM CLIENTES ' +
    searchTelefonoQuery(telefono_fijo_cliente, telefono_movil_cliente, '') +
    ` ${id_cliente ? ` AND ID <> ${id_cliente}` : ``}`;

  const queryTelefonosAval =
    'SELECT TOP 1 ID_AVAL AS value FROM AVALES ' +
    searchTelefonoQuery(telefono_fijo_aval, telefono_movil_aval, '') +
    ` ${id_aval ? ` AND ID_AVAL <> ${id_aval}` : ``}`;

  const queryAddress = 'SELECT ID AS value FROM DOMICILIOS WHERE ID = '
  const queryAddressCustomer = `${queryAddress} ${id_domicilio_cliente || '0'}`
  const queryAddressEndorsement = `${queryAddress} ${id_domicilio_aval || '0'}`
  let queryLoanToRefinance = ''

  if (
    id_cliente !== null &&
    id_cliente !== undefined &&
    id_cliente > 0 &&
    id_loan_to_refinance !== null &&
    id_loan_to_refinance !== undefined &&
    id_loan_to_refinance > 0
  ) {
    const selectStatement = querySearchLoanToRefinance(' t0.cantidad_restante as value ')
    const whereStatement = ` and t0.id_cliente = ${id_cliente} and t0.id = ${id_loan_to_refinance} `
    queryLoanToRefinance = selectStatement + whereStatement
  }
  else {
    queryLoanToRefinance = 'SELECT 0'
  }

  return `SELECT ID AS value FROM USUARIOS WHERE ACTIVO = 1 AND ID = ${id_agente}
          SELECT ID AS value FROM USUARIOS WHERE ACTIVO = 1 AND ID = ${user_id}
          SELECT ID_GRUPO AS value FROM GRUPOS_AGENTES WHERE ACTIVO = 1 AND ID_GRUPO = ${id_grupo_original}
          SELECT TASA_DE_INTERES AS value FROM PLAZO WHERE ID = ${id_plazo}
          SELECT TOP 1 ID AS value FROM CLIENTES WHERE CURP = '${curp_cliente}'
          SELECT TOP 1 ID_AVAL AS value FROM AVALES WHERE CURP = '${curp_aval}'
          ${queryTelefonosCliente}
          ${queryTelefonosAval}
          SELECT ID_ROL AS value FROM SEC_ROLES WHERE DESCRIPCION = '${rol_de_usuario}'
          ${queryLoanToRefinance}
          ${queryAddressCustomer}
          ${queryAddressEndorsement}
          `;
}

function validateDataResult(
  fecha_inicial: Date,
  fecha_final_estimada: Date,
  idAgente: number,
  idUsuario: number,
  idGrupo: number,
  tasaInteres: number,
  idRolDeUsuario: number,
  id_current_loan: number,
  amountToRefinance: number,
  cantidad_prestada: number,
  id_domicilio_cliente: number,
  idDomicilioCliente: number,
  id_domicilio_aval: number,
  idDomicilioAval: number,
  idClienteCurp: number,
  idAvalCurp: number,
  idClienteTelefono: number,
  idAvalTelefono: number,
  id_cliente: number,
  id_aval: number,
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

  if (!idRolDeUsuario) {
    return { result: false, message: 'El rol de usuario no existe' };
  }

  if (id_current_loan && !amountToRefinance) {
    return {
      result: false,
      message: 'El préstamo no es válido para refinanciamiento',
    };
  }

  if (id_current_loan && cantidad_prestada < amountToRefinance) {
    return {
      result: false,
      message: 'La cantidad prestada no puede ser menor al monto a refinanciar',
    };
  }

  if (id_domicilio_cliente && !idDomicilioCliente) {
    return {
      result: false,
      message: 'El domicilio del cliente no existe o no es válido',
    };
  }

  if (id_domicilio_aval && !idDomicilioAval) {
    return {
      result: false,
      message: 'El domicilio del aval no existe o no es válido',
    };
  }

  if (idClienteCurp && (idClienteCurp != id_cliente)) {
    return {
      result: false,
      message: 'La CURP ya existe para otro cliente',
    };
  }

  if (idClienteTelefono && (id_cliente || !id_cliente)) {
    return {
      result: false,
      message: 'Alguno de los teléfonos ya existen para otro cliente',
    };
  }

  if (idAvalCurp && (idAvalCurp != id_aval)) {
    return {
      result: false,
      message: 'La CURP ya existe para otro aval',
    };
  }

  if (idAvalTelefono && (id_aval || !id_aval)) {
    return {
      result: false,
      message: 'Alguno de los teléfonos ya existen para otro aval',
    };
  }

  return { result: true };
}
