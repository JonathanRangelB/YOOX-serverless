export interface SPInsertNewLoanRequest {
    id:	number;
    request_number:	string;
    loan_request_status:	string;
    id_agente:	number;
    id_grupo_original:	number;
    id_cliente:	number;
    nombre_cliente:	string;
    apellido_paterno_cliente:	string;
    apellido_materno_cliente:	string;
    telefono_fijo:	string;
    telefono_movil:	string;
    correo_electronico:	string;
    ocupacion:	string;
    curp:	string;
    tipo_calle:	string;
    nombre_calle:	string;
    numero_exterior:	string;
    numero_interior:	string;
    colonia:	string;
    municipio:	string;
    estado:	string;
    cp:	string;
    referencias:	string;
    id_plazo:	number;
    cantidad_prestada:	number;
    dia_semana:	string;
    fecha_inicial:	Date;
    fecha_final_estimada:	Date;
    cantidad_pagar:	number;
    tasa_interes:	number;
    observaciones:	string;
    created_by:	number;
    created_date:	Date;
    modified_date:	Date;
    closed_by:	number;
    closed_date:	Date;
    status_code:	number;
}

