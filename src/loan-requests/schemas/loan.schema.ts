export const loanSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    request_number: { type: "string" },
    id_cliente: { type: "integer" },
    id_plazo: { type: "integer" },
    cantidad_prestada: { type: "number", minimum: 1000 }, //greater than 1000 --range [100, 10000]
    dia_semana: { type: "string", enum: ["VIERNES", "MARTES", "JUEVES", "MIERCOLES", "SABADO", "DOMINGO", "LUNES"] },
    fecha_inicial: { type: "string", format: "date-time" },
    fecha_final_estimada: { type: "string", format: "date-time" },
    id_cobrador: { type: "integer" },
    cantidad_pagar: { type: "number" },
    status: { type: "string", enum: ["EN_REVISION", "APROBADO", "EMITIDO"] },
    tasa_interes: { type: "integer" },
    id_grupo_original: { type: "integer" },
    created_by: { type: "integer" },
    created_date: { type: "string", format: "date-time" },
    modified_by: { type: "integer" },
    modified_date: { type: "string", format: "date-time" },
    approved_date: { type: "string", format: "date-time" },
    approved_by: { type: "integer" },
    status_code: { type: "integer" },
  },
  required: [
    "id_cliente",
    "id_plazo", 
    "cantidad_prestada", 
    "dia_semana", 
    "fecha_inicial", 
    "fecha_final_estimada", 
    "id_cobrador", 
    "cantidad_pagar", 
    "status", 
    "tasa_interes",
    "id_grupo_original",
    "created_by"
],

  additionalProperties: false,
};