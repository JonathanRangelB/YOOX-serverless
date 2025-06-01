export interface TokenPayload {
  ID: number;
  NOMBRE: string;
  ROL: string;
  ACTIVO: boolean;
  ID_GRUPO: number;
  ID_ROL: number;
  iat: number;
  exp: number;
}

export interface RefreshRequestBody {
  token: string;
}
