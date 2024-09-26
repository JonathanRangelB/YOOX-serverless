export interface SPInsertNewLoanRequest {
    ID: number;
    REQUEST_NUMBER: string;
    ID_CLIENTE: number;
    ID_PLAZO: number;
    CANTIDAD_PRESTADA: number;
    DIA_SEMANA: string;
    FECHA_INICIAL: Date;
    FECHA_FINAL_ESTIMADA: Date;
    ID_COBRADOR: number;
    CANTIDAD_PAGAR: number;
    STATUS: string;
    TASA_INTERES: number;
    ID_GRUPO_ORIGINAL: number;
    CREATED_BY: number;
    CREATED_DATE: Date;
    MODIFIED_BY: number;
    MODIFIED_DATE: Date;
    APPROVED_DATE: Date;
    APPROVED_BY: number;
    STATUS_CODE: number;
}