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
  id_agente: number
}

export interface SolicitudPrestamoLista {

}

export interface validateSearchLoanRequestListResponse {
  valid: boolean;
  error?: string;
}