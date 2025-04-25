export interface DatosAval {
    id: number;
    curp: string;
    nombre: string;
}

export interface AvalDomicilio {
    id_aval: number;
    nombre: string;
    telefono_fijo: string;
    telefono_movil: string;
    correo_electronico: string;
    curp: string;
    id_domicilio: number;
    tipo_calle: string;
    nombre_calle: string;
    numero_exterior: string;
    numero_interior: string;
    colonia: string;
    municipio: string;
    estado: string;
    cp: string;
    referencias_dom: string;
}

export interface ValidateSearchGuarantorParametersResponse {
    valid: boolean;
    error?: string;
}
