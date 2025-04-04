export interface DatosBusquedaCurp {
  curp: string;
  table: string;
  id_persona: number;
}

export interface ValidateSearchCurpParametersResponse {
  valid: boolean;
  error?: string;
}

export interface ResultadoCurp {
  id: number;
}
export interface DatosBusquedaTelefono {
  telefono_fijo: string;
  telefono_movil: string;
  table: string;
  id_persona: number;
}

export interface ResultadoTelefono {
  id: number;
}

export interface ValidateSearchTelefonoParametersResponse {
  valid: boolean;
  error?: string;
}
