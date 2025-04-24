export type Status = 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';

export interface StatusResponse {
  customerFolderName: string | undefined;
  error?: string;
}

export interface UpdateStatusResponse {
  message?: string;
  error?: string;
}

export interface DatosSolicitudPrestamoLista {
  id_usuario: number;
  rol_usuario: string;
  offSetRows: number;
  fetchRowsNumber: number;
  status?: string;
  nombreCliente?: string;
  folio?: string;
  userIdFilter?: number;
}

export interface SolicitudPrestamoLista {
  request_number: string;
  nombre_cliente: string;
  cantidad_prestada: number;
  created_date: Date;
  loan_request_status: string;
}

export interface ValidateSearchLoanRequestListResponse {
  valid: boolean;
  error?: string;
}
