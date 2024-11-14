import { DateTime, Float, Int, Table, VarChar } from 'mssql';

import { InsertNewLoanRequest } from '../types/SPInsertNewLoanRequest';

export function generateNewLoanRequestTable(
  newLoanRequest: InsertNewLoanRequest,
  additionalData: {
    id: number;
    request_number: string;
    loan_request_status: string;
    tasaInteres: number;
    created_date: Date;
  }
) {
  const status_code = undefined;

  const {
    formCliente,
    fecha_inicial,
    plazo,
    cantidad_prestada,
    id_grupo_original,
    id_cliente,
    id_agente,
    dia_semana,
    fecha_final_estimada,
    cantidad_pagar,
    created_by,
  } = newLoanRequest;

  const { id: id_plazo } = plazo;

  const {
    nombre_cliente,
    apellido_paterno_cliente,
    apellido_materno_cliente,
    telefono_fijo_cliente,
    telefono_movil_cliente,
    correo_electronico_cliente,
    ocupacion_cliente,
    curp_cliente,
    tipo_calle_cliente: calleC,
    nombre_calle_cliente,
    numero_exterior_cliente,
    numero_interior_cliente,
    colonia_cliente,
    municipio_cliente,
    estado_cliente: efc,
    cp_cliente,
    observaciones_cliente,
    referencias_cliente: referencias,
  } = formCliente;

  const { value: tipo_calle_cliente } = calleC;
  const { value: estado_cliente } = efc;

  // TODO: CAMPOS DE AVAL, PENDIENTES DE IMPLEMENTAR
  // const {
  //   nombre_aval,
  //   apellido_paterno_aval,
  //   apellido_materno_aval,
  //   telefono_fijo_aval,
  //   telefono_movil_aval,
  //   correo_electronico_aval,
  //   ocupacion_aval,
  //   curp_aval,
  //   calle_aval: calleA,
  //   nombre_calle_aval,
  //   numero_exterior_aval,
  //   numero_interior_aval,
  //   colonia_aval,
  //   municipio_aval,
  //   entidadFederativa: efa,
  //   cp_aval,
  //   observaciones_aval,
  // } = formAval;
  // const { value: tipo_calle_aval } = calleA;
  // const { value } = efa;

  const { id, request_number, loan_request_status, tasaInteres, created_date } =
    additionalData;

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
    referencias,
    id_plazo,
    cantidad_prestada,
    dia_semana,
    fecha_inicial,
    fecha_final_estimada,
    cantidad_pagar,
    tasaInteres,
    observaciones_cliente,
    created_by,
    created_date,
    status_code
  );

  return tableNewRequestLoan;
}
