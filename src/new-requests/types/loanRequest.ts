export type Status =
    'EN REVISION' |
    'APROBADO' |
    'RECHAZADO'


export interface statusResponse {
    message: string;
    err?: string;
}