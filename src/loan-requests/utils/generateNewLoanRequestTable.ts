import { DateTime, Float, Int, Table, VarChar } from "mssql";

import { InsertNewLoanRequest } from "../types/SPInsertNewLoanRequest";

export function generateNewLoanRequestTable(
  newLoanRequest: InsertNewLoanRequest,
  additionalData: {
    id: number;
    request_number: string;
    loan_request_status: string;
    created_date: Date;
  }
) {
  const {
    cantidad_prestada,
    plazo,
    id_agente,
    created_by,
    id_grupo_original,
    fecha_final_estimada,
    dia_semana,
    observaciones,
    cantidad_pagar,
    fecha_inicial,
    formCliente,
    formAval,
    id_loan_to_refinance,
    id_gerencia_original
  } = newLoanRequest;

  const { id: id_plazo, semanas_plazo, tasa_de_interes } = plazo;

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
    tipo_calle_cliente: calleC,
    nombre_calle_cliente,
    numero_exterior_cliente,
    numero_interior_cliente,
    colonia_cliente,
    municipio_cliente,
    estado_cliente: efc,
    cp_cliente,
    referencias_dom_cliente,
    id_domicilio_cliente,
    cruce_calles_cliente,
    gmaps_url_location
  } = formCliente;

  const { value: tipoCalleCliente } = calleC;
  const { value: estadoCliente } = efc;

  const {
    id_aval,
    nombre_aval,
    apellido_paterno_aval,
    apellido_materno_aval,
    telefono_fijo_aval,
    telefono_movil_aval,
    correo_electronico_aval,
    curp_aval,
    tipo_calle_aval: calleA,
    nombre_calle_aval,
    numero_exterior_aval,
    numero_interior_aval,
    colonia_aval,
    municipio_aval,
    estado_aval: efa,
    cp_aval,
    referencias_dom_aval,
    id_domicilio_aval,
    cruce_calles_aval,
    ocupacion_aval,
  } = formAval;

  const { value: tipoCalleAval } = calleA;
  const { value: estadoAval } = efa;
  const { id, request_number, loan_request_status, created_date } =
    additionalData;

  const tableNewRequestLoan = new Table("LOAN_REQUEST");

  tableNewRequestLoan.create = false;

  tableNewRequestLoan.columns.add("ID", Int, { nullable: false });
  tableNewRequestLoan.columns.add("REQUEST_NUMBER", VarChar, {
    nullable: false,
  });
  tableNewRequestLoan.columns.add("LOAN_REQUEST_STATUS", VarChar, {
    nullable: false,
  });
  tableNewRequestLoan.columns.add("ID_AGENTE", Int, { nullable: true });
  tableNewRequestLoan.columns.add("ID_GRUPO_ORIGINAL", Int, { nullable: true });
  tableNewRequestLoan.columns.add("ID_CLIENTE", Int, { nullable: true });
  tableNewRequestLoan.columns.add("NOMBRE_CLIENTE", VarChar, {
    nullable: false,
  });
  tableNewRequestLoan.columns.add("APELLIDO_PATERNO_CLIENTE", VarChar, {
    nullable: false,
  });
  tableNewRequestLoan.columns.add("APELLIDO_MATERNO_CLIENTE", VarChar, {
    nullable: false,
  });
  tableNewRequestLoan.columns.add("TELEFONO_FIJO_CLIENTE", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("TELEFONO_MOVIL_CLIENTE", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("CORREO_ELECTRONICO_CLIENTE", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("OCUPACION_CLIENTE", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("CURP_CLIENTE", VarChar, { nullable: false });
  tableNewRequestLoan.columns.add("ID_DOMICILIO_CLIENTE", Int, {
    nullable: true,
  });

  tableNewRequestLoan.columns.add("TIPO_CALLE_CLIENTE", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("NOMBRE_CALLE_CLIENTE", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("NUMERO_EXTERIOR_CLIENTE", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("NUMERO_INTERIOR_CLIENTE", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("COLONIA_CLIENTE", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("MUNICIPIO_CLIENTE", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("ESTADO_CLIENTE", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("CP_CLIENTE", VarChar, { nullable: true });
  tableNewRequestLoan.columns.add("REFERENCIAS_DOM_CLIENTE", VarChar, {
    nullable: true,
  });

  //AVAL INICIO
  tableNewRequestLoan.columns.add("ID_AVAL", Int, { nullable: true });
  tableNewRequestLoan.columns.add("NOMBRE_AVAL", VarChar, { nullable: false });
  tableNewRequestLoan.columns.add("APELLIDO_PATERNO_AVAL", VarChar, {
    nullable: false,
  });
  tableNewRequestLoan.columns.add("APELLIDO_MATERNO_AVAL", VarChar, {
    nullable: false,
  });
  tableNewRequestLoan.columns.add("TELEFONO_FIJO_AVAL", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("TELEFONO_MOVIL_AVAL", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("CORREO_ELECTRONICO_AVAL", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("CURP_AVAL", VarChar, { nullable: false });

  tableNewRequestLoan.columns.add("ID_DOMICILIO_AVAL", Int, { nullable: true });

  tableNewRequestLoan.columns.add("TIPO_CALLE_AVAL", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("NOMBRE_CALLE_AVAL", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("NUMERO_EXTERIOR_AVAL", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("NUMERO_INTERIOR_AVAL", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("COLONIA_AVAL", VarChar, { nullable: true });
  tableNewRequestLoan.columns.add("MUNICIPIO_AVAL", VarChar, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("ESTADO_AVAL", VarChar, { nullable: true });
  tableNewRequestLoan.columns.add("CP_AVAL", VarChar, { nullable: true });
  tableNewRequestLoan.columns.add("REFERENCIAS_DOM_AVAL", VarChar, {
    nullable: true,
  });
  //AVAL FIN

  tableNewRequestLoan.columns.add("ID_PLAZO", Int, { nullable: false });

  tableNewRequestLoan.columns.add("TASA_DE_INTERES", Int, { nullable: true });
  tableNewRequestLoan.columns.add("SEMANAS_PLAZO", VarChar, {
    nullable: false,
  });

  tableNewRequestLoan.columns.add("CANTIDAD_PRESTADA", Float, {
    nullable: false,
  });
  tableNewRequestLoan.columns.add("DIA_SEMANA", VarChar, { nullable: false });
  tableNewRequestLoan.columns.add("FECHA_INICIAL", DateTime, {
    nullable: false,
  });
  tableNewRequestLoan.columns.add("FECHA_FINAL_ESTIMADA", DateTime, {
    nullable: false,
  });
  tableNewRequestLoan.columns.add("CANTIDAD_PAGAR", Float, { nullable: true });
  tableNewRequestLoan.columns.add("OBSERVACIONES", VarChar, { nullable: true });
  tableNewRequestLoan.columns.add("CREATED_BY", Int, { nullable: false });
  tableNewRequestLoan.columns.add("CREATED_DATE", DateTime, {
    nullable: false,
  });
  tableNewRequestLoan.columns.add("ID_LOAN_TO_REFINANCE", Int, {
    nullable: true,
  });
  tableNewRequestLoan.columns.add("OCUPACION_AVAL", VarChar, { nullable: true });
  tableNewRequestLoan.columns.add("GMAPS_URL_LOCATION", VarChar, { nullable: true });
  tableNewRequestLoan.columns.add("CRUCE_CALLES_CLIENTE", VarChar, { nullable: true });
  tableNewRequestLoan.columns.add("CRUCE_CALLES_AVAL", VarChar, { nullable: true });
  tableNewRequestLoan.columns.add("ID_GERENCIA_ORIGINAL", Int, { nullable: true });

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
    telefono_fijo_cliente || undefined,
    telefono_movil_cliente,
    correo_electronico_cliente || undefined,
    ocupacion_cliente,
    curp_cliente,
    id_domicilio_cliente,
    tipoCalleCliente,
    nombre_calle_cliente,
    numero_exterior_cliente,
    numero_interior_cliente || undefined,
    colonia_cliente,
    municipio_cliente,
    estadoCliente,
    cp_cliente,
    referencias_dom_cliente || undefined,
    id_aval,
    nombre_aval,
    apellido_paterno_aval,
    apellido_materno_aval,
    telefono_fijo_aval || undefined,
    telefono_movil_aval,
    correo_electronico_aval || undefined,
    curp_aval,
    id_domicilio_aval,
    tipoCalleAval,
    nombre_calle_aval,
    numero_exterior_aval,
    numero_interior_aval || undefined,
    colonia_aval,
    municipio_aval,
    estadoAval,
    cp_aval,
    referencias_dom_aval || undefined,
    id_plazo,
    tasa_de_interes,
    semanas_plazo,
    cantidad_prestada,
    dia_semana,
    fecha_inicial,
    fecha_final_estimada,
    cantidad_pagar,
    observaciones || undefined,
    created_by,
    created_date.toISOString(),
    id_loan_to_refinance || undefined,
    ocupacion_aval || undefined,
    gmaps_url_location || undefined,
    cruce_calles_cliente || undefined,
    cruce_calles_aval || undefined,
    id_gerencia_original || undefined,
  );

  return tableNewRequestLoan;
}
