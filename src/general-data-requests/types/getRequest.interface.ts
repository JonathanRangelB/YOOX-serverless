export interface DatosSolicitudDetalle {
  request_number: string;
}

export interface SolicitudDetalle {
  id: number;
  request_number: string;
  loan_request_status: string;
  id_agente: number;
  id_grupo_original: number;
  id_cliente: number;
  nombre_cliente: string;
  apellido_paterno_cliente: string;
  apellido_materno_cliente: string;
  telefono_fijo_cliente: string;
  telefono_movil_cliente: string;
  correo_electronico_cliente: string;
  ocupacion_cliente: string;
  curp_cliente: string;
  tipo_calle_cliente: string;
  nombre_calle_cliente: string;
  numero_exterior_cliente: string;
  numero_interior_cliente: string;
  colonia_cliente: string;
  municipio_cliente: string;
  estado_cliente: string;
  cp_cliente: string;
  referencias_dom_cliente: string;
  id_aval: number;
  nombre_aval: string;
  apellido_paterno_aval: string;
  apellido_materno_aval: string;
  telefono_fijo_aval: string;
  telefono_movil_aval: string;
  correo_electronico_aval: string;
  curp_aval: string;
  tipo_calle_aval: string;
  nombre_calle_aval: string;
  numero_exterior_aval: string;
  numero_interior_aval: string;
  colonia_aval: string;
  municipio_aval: string;
  estado_aval: string;
  cp_aval: string;
  referencias_dom_aval: string;
  id_plazo: number;
  cantidad_prestada: number;
  dia_semana: string;
  fecha_inicial: Date;
  fecha_final_estimada: Date;
  cantidad_pagar: number;
  tasa_interes: number;
  observaciones: string;
  created_by: number;
  created_date: Date;
  modified_by: number;
  modified_date: Date;
  closed_by: number;
  closed_date: Date;
  status_code: number;
}

