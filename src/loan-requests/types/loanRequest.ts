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

