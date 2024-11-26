export interface InsertNewLoanRequest {
  cantidad_prestada: number;
  plazo: Plazo;
  id_agente: number;
  created_by: number;
  id_grupo_original: number;
  fecha_final_estimada: Date;
  dia_semana: string;
  observaciones: string;
  cantidad_pagar: number;
  status_code: number;
  fecha_inicial: Date;
  formCliente: FormCliente;
  formAval: FormAval;
}

export interface FormCliente {
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
}

export interface FormAval {
  id_aval: number;
  nombre_aval: string;
  apellido_paterno_aval: string;
  apellido_materno_aval: string;
  telefono_fijo_aval: string;
  telefono_movil_aval: string;
  correo_electronico_aval: string;
  ocupacion_aval: string;
  curp_aval: string;
  tipo_calle_aval: TipoCalle;
  nombre_calle_aval: string;
  numero_exterior_aval: string;
  numero_interior_aval: string;
  colonia_aval: string;
  municipio_aval: string;
  estado_aval: EntidadFederativa;
  cp_aval: string;
  referencias_dom_aval: string;
}

export interface TipoCalle {
  name: string;
  value: string;
}

export interface EntidadFederativa {
  name: string;
  value: string;
}

export interface Plazo {
  name: string;
  value: string;
  id: number;
}
