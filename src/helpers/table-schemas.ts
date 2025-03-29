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
  id: number;
  nombre: string;
  telefono_fijo: string;
  telefono_movil: string;
  correo_electronico: string;
  activo: number;
  clasificacion: string;
  observaciones: string;
  id_agente: number;
  ocupacion: string;
  curp: string;
  id_domicilio: number;
}

export interface error_code {
  ID: number;
  STATUS_CODE: number;
  MESSAGE: string;
}

export interface last_loan_id {
  LAST_LOAN_ID: number;
  CURRENT_DATE_SERVER: Date;
}

export interface loan_update_date {
  loan_id: number;
  request_number: string;
  loan_request_status: string;
  current_date_server: Date;
}

export interface indexes_id {
  objeto: string;
  indice: number;
}

export interface address {
  id: number;
  tipo_calle: string;
  nombre_calle: string;
  numero_exterior: string;
  numero_interior: string;
  colonia: string;
  municipio: string;
  estado: string;
  cp: string;
  referencias: string;
  created_by_usr: number;
  created_date: Date;
  modified_by_usr: number;
  modified_date: Date;
}

export interface address_suite_number {
  id_domicilio: number;
  numero_interior: string;
  id_cliente: number;
  id_aval: number;
  tipo: string;
}

export interface loan_refinance {
  id_prestamo: number;
  id_cliente: number;
  cantidad_restante: number;
}

export interface refinance {
  id_refinanciamiento?: number;
  fecha?: Date;
  id_usuario?: number;
  id_cliente?: number;
  id_prestamo_actual?: number;
  id_prestamo_nuevo?: number;
  cantidad_refinanciada?: number;
}