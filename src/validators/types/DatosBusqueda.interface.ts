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