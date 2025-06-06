export interface PagosReglasDias {
  id: number;
  id_cliente: number;
  numero_dias: number;
}

export interface LastLoanId {
  LAST_LOAN_ID: number;
  CURRENT_DATE_SERVER: Date;
}

export interface LoanUpdateDate {
  loan_id: number;
  request_number: string;
  loan_request_status: string;
  current_date_server: Date;
}

export interface IndexesId {
  objeto: string;
  indice: number;
}

export interface Address {
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

export interface LoanRefinance {
  id_prestamo: number;
  id_cliente: number;
  cantidad_restante: number;
}

export interface Refinance {
  id_refinanciamiento?: number;
  fecha: Date;
  id_usuario?: number;
  id_cliente?: number;
  id_prestamo_actual?: number;
  id_prestamo_nuevo?: number;
  cantidad_refinanciada?: number;
}
