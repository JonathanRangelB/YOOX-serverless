export interface SPInsertNewLoanRequest {
    id: number;
    request_number: string;
    id_cliente: number;
    id_plazo: number;
    cantidad_prestada: number;
    dia_semana: string;
    fecha_inicial: Date;
    fecha_final_estimada: Date;
    id_cobrador: number;
    cantidad_pagar: number;
    status: string;
    tasa_interes: number;
    id_grupo_original: number;
    created_by: number;
    created_date: Date;
    modified_by: number;
    modified_date: Date;
    approved_date: Date;
    approved_by: number;
    status_code: number;
}