export interface Pagos {
  ID: number;
  ID_PRESTAMO: number;
  NUMERO_SEMANA: number;
  ID_CLIENTE: number;
  FECHA: Date;
  ID_USUARIO: number;
  CANTIDAD_PAGADA: number;
  ID_CORTE: number;
  CANCELADO: string;
  FECHA_cANCELADO: Date;
  USUARIO_CANCELO: number;
  ID_MULTA: number;
  ID_COBRADOR: number;
  ID_CONCEPTO: number;
  HORA_CREACION: string;
  DATETIME_STAMP_SERVER: Date;
}
