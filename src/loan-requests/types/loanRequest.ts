export type Status = 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';

export interface statusResponse {
  customerFolderName: string | undefined;
  error?: string;
}

export interface updateStatusResponse {
  message?: string;
  error?: string;
}

export interface DatosSolicitudPrestamoLista {
  id_agente: number;
}

export interface SolicitudPrestamoLista {
  request_number: string;
  nombre_cliente: string;
  cantidad_prestada: number;
  created_date: Date;
  loan_request_status: string;
}

export interface validateSearchLoanRequestListResponse {
  valid: boolean;
  error?: string;
}
