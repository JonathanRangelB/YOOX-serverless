export interface DatosBusquedaCurp {
  id: number;
  curp: string;
  table: string;
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
}

export interface ResultadoTelefono {
  id: number;
}

export interface ValidateSearchTelefonoParametersResponse {
  valid: boolean;
  error?: string;
}
