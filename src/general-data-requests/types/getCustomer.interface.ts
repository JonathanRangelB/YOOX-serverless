export interface DatosCliente {
  id: number;
  curp: string;
  nombre: string;
}

export interface ClienteDomicilio {
  id: number;
  nombre: string;
  telefono_fijo: string;
  telefono_movil: string;
  correo_electronico: string;
  observaciones: string;
  id_agente: number;
  nombre_agente: string;
  ocupacion: string;
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
  referencias: string;
}
