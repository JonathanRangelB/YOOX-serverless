export type Status = 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';

export interface statusResponse {
  customerFolderName: string | undefined;
  error?: string;
}
