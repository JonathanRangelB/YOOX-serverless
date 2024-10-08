export interface pagos_reglas_dias {
  id: number;
  id_cliente: number;
  numero_dias: number;
}

export interface customer_loan_request {
  ID_LOAN_REQUEST: number;
  ID_CLIENT_REQUEST: number;
  ID_CLIENT: number;
}

export interface customer_request {
  ID: number;
  NOMBRE: string;
  TELEFONO_FIJO: string;
  TELEFONO_MOVIL: string;
  CORREO_ELECTRONICO: string;
  ESTATUS: string;
  OBSERVACIONES: string;
  ID_AGENTE: number;
  OCUPACION: string;
  CURP: string;
  ID_DOMICILIO: number;
  TIPO_CALLE: string;
  NOMBRE_CALLE: string;
  NUMERO_EXTERIOR: string;
  NUMERO_INTERIOR: string;
  COLONIA: string;
  MUNICIPIO: string;
  ESTADO: string;
  CP: string;
  REFERENCIAS: string;
  CREATED_BY: number;
  CREATED_DATE: Date;
  MODIFIED_BY: number;
  MODIFIED_DATE: Date;
  APPROVED_BY: number;
  APPROVED_DATE: Date;
  STATUS_CODE: number;
}

export interface error_code {
  ID: number;
  STATUS_CODE: number;
  MESSAGE: string;
}

export interface loan_request {
  ID: number;
  REQUEST_NUMBER: string;
  ID_CLIENTE: number;
  ID_PLAZO: number;
  CANTIDAD_PRESTADA: number;
  DIA_SEMANA: string;
  FECHA_INICIAL: Date;
  FECHA_FINAL_ESTIMADA: Date;
  ID_COBRADOR: number;
  CANTIDAD_PAGAR: number;
  STATUS: string;
  TASA_INTERES: number;
  ID_GRUPO_ORIGINAL: number;
  CREATED_BY: number;
  CREATED_DATE: Date;
  MODIFIED_BY: number;
  MODIFIED_DATE: Date;
  APPROVED_BY: number;
  APPROVED_DATE: Date;
  STATUS_CODE: number;
}
