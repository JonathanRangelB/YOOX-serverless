export interface loanHeader {
    id: number;
    id_cliente: number;
    id_plazo: number;
    id_usuario: number;
    cantidad_prestada: number;
    dia_semana: string;
    fecha_inicial: Date;
    fecha_final_estimada: Date;
    fecha_final_real: Date;
    id_cobrador: number;
    id_corte: number;
    cantidad_restante: number;
    cantidad_pagar: number;
    estatus: string;
    fecha_cancelado: Date;
    usuario_cancelo: number;
    id_concepto: number;
    id_multa: number;
    tasa_interes: number;
    id_grupo_original: number;
    semanas_plazo: number
}

export interface loanDetail {
    id_prestamo: number;
    numero_semana: number;
    id_usuario: number;
    fecha_vencimiento: Date;
    status: string;
    cantidad: number;
    id_cobrador: number;
    saldo_pendiente: number;
    promesa_pago: Date;
    modo_insercion: string;
    insertado_por: number;
}