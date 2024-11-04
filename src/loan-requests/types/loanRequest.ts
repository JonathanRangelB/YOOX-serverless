export type Status = 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';

export interface statusResponse {
  message: string;
  customerFolderName?: string;
  error?: string;
}
