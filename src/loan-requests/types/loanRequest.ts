import { StatusCodes } from "../../helpers/statusCodes";

export interface StatusResponse {
  customerFolderName: string | undefined;
  error?: string;
}

export interface UpdateStatusResponse {
  message?: string;
  error?: string;
  statusCode?: StatusCodes;
}

export interface DatosSolicitudPrestamoLista {
  id_usuario: number;
  rol_usuario: string;
  status?: string;
  nombreCliente?: string;
  folio?: string;
  userIdFilter?: number;
  groupIdFilter?: number;
  managementIdFilter?: number;
}

export interface SolicitudPrestamoLista {
  request_number: string;
  nombre_cliente: string;
  cantidad_prestada: number;
  created_date: Date;
  loan_request_status: string;
}
