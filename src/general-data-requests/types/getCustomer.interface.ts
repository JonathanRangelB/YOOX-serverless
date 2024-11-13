export interface DatosCliente {
    id: number, 
    curp: string, 
    nombre: string
   }
  
   export interface ClienteDomicilio {
    ID:                   number;
    ID_CLIENTE:           number;
    ID_PLAZO:             number;
    ID_USUARIO:           number;
    CANTIDAD_PRESTADA:    number;
    DIA_SEMANA:           string;
    FECHA_INICIAL:        Date;
    FECHA_FINAL_ESTIMADA: Date;
    FECHA_FINAL_REAL:     Date;
    ID_COBRADOR:          number;
    ID_CORTE:             null;
    CANTIDAD_RESTANTE:    number;
    CANTIDAD_PAGAR:       number;
    STATUS:               string;
    FECHA_CANCELADO:      Date;
    USUARIO_CANCELO:      number;
    ID_CONCEPTO:          number;
    ID_MULTA:             null;
    TASA_INTERES:         number;
    ID_GRUPO_ORIGINAL:    null;
    NOMBRE_CLIENTE:       string;
  }