export interface PrestamosDetalle {
  ID_PRESTAMO: number;
  NUMERO_SEMANA: number;
  ID_USUARIO: number;
  FECHA_VENCIMIENTO: Date;
  STATUS: string;
  CANTIDAD: number;
  ID_COBRADOR: number;
  SALDO_PENDIENTE: number;
  PROMESA_PAGO: Date;
  MODO_INSERCION: string;
  INSERTADO_POR: number;
}
