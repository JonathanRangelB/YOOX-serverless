import { TipoCalle } from "./common-properties";
import { EntidadFederativa } from "./common-properties";

export interface formCustomer {
    id_cliente: number;
    nombre_cliente: string;
    apellido_paterno_cliente: string;
    apellido_materno_cliente: string;
    telefono_fijo_cliente: string;
    telefono_movil_cliente: string;
    correo_electronico_cliente: string;
    ocupacion_cliente: string;
    curp_cliente: string;
    tipo_calle_cliente: TipoCalle;
    nombre_calle_cliente: string;
    numero_exterior_cliente: string;
    numero_interior_cliente: string;
    colonia_cliente: string;
    municipio_cliente: string;
    estado_cliente: EntidadFederativa;
    cp_cliente: string;
    referencias_dom_cliente: string;
    id_agente: number;
    cliente_creado_por: number;
    fecha_creacion_cliente: Date;
    cliente_modificado_por: number;
    fecha_modificacion_cliente: Date;
    cliente_activo: number;
    observaciones_cliente: string;
    id_domicilio_cliente: number;
    id_aval: number;
}

