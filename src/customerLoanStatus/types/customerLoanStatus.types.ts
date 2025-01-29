export interface CustomerLoanStatus {
  request_number: string;
  loan_request_status: string;
  nombre_agente: string;
  nombre_cliente: string;
  apellido_paterno_cliente: string;
  apellido_materno_cliente: string;
  nombre_aval: string;
  apellido_paterno_aval: string;
  apellido_materno_aval: string;
  cantidad_prestada: number;
  fecha_inicial: Date;
}
