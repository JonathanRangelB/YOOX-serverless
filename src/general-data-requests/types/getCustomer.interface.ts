export interface DatosCliente {
  id: number;
  curp: string;
  nombre: string;
  id_agente: number;
}

export interface ClienteDomicilio {
  id_cliente: number;
  nombre_cliente: string;
  telefono_fijo_cliente: string;
  telefono_movil_cliente: string;
  correo_electronico_cliente: string;
  id_agente: number;
  nombre_agente: string;
  ocupacion_cliente: string;
  curp_cliente: string;
  id_domicilio_cliente: number;
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
  telefono_fijo_aval: string;
  telefono_movil_aval: string;
  correo_electronico_aval: string;
  curp_aval: string;
  id_domicilio_aval: number;
  tipo_calle_aval: string;
  nombre_calle_aval: string;
  numero_exterior_aval: string;
  numero_interior_aval: string;
  colonia_aval: string;
  municipio_aval: string;
  estado_aval: string;
  cp_aval: string;
  referencias_dom_aval: string;
}

export interface validateSearchCustomerParametersResponse {
  valid: boolean;
  error?: string;
}