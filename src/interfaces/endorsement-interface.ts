import { TipoCalle } from './common-properties';
import { EntidadFederativa } from './common-properties';

export interface FormEndorsement {
  id_aval: number;
  nombre_aval: string;
  apellido_paterno_aval: string;
  apellido_materno_aval: string;
  telefono_fijo_aval: string;
  telefono_movil_aval: string;
  correo_electronico_aval: string;
  observaciones_aval: string;
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
  aval_creado_por: number;
  fecha_creacion_aval: Date;
  aval_modificado_por: number;
  fecha_modificacion_aval: Date;
  id_domicilio_aval: number;
}
