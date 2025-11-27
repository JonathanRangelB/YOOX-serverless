export interface TipoCalle {
  name: string;
  value: string;
}

export interface EntidadFederativa {
  name: string;
  value: string;
}

export interface Direccion {
  id: number;
  tipo_calle: TipoCalle;
  nombre_calle: string;
  numero_exterior: string;
  numero_interior: string;
  colonia: string;
  municipio: string;
  estado: EntidadFederativa;
  cp: string;
  referencias_dom: string;
  usuario: number;
  fecha_operacion: Date;
  gmaps_url_location?: string;
  cruce_calles: string;
}
