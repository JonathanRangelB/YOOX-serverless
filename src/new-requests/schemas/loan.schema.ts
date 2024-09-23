export const loanSchema = {
  "type": "object",
  "properties": {
    "id": { "type":"integer"},
    "request_number": { "type":"string"},
    "id_cliente": { "type":"integer"},
    "id_plazo": { "type":"integer"},
    "cantidad_prestada": { "type":"number"},
    "dia_semana": { "type":"string"},
    "fecha_inicial": { "type":"string","format": "date"},
    "fecha_final_estimada": { "type":"string","format": "date"},
    "id_cobrador": { "type":"integer"},
    "cantidad_pagar": { "type":"number"},
    "status": { "type":"string"},
    "tasa_integereres": { "type":"integer"},
    "id_grupo_original": { "type":"integer"},
    "created_by": { "type":"integer"},
    "created_date": { "type":"string","format": "date"},
    "modified_by": { "type":"integer"},
    "modified_date": { "type":"string","format": "date"},
    "approved_date": { "type":"string","format": "date"},
    "approved_by": { "type":"integer"},
    "status_code": { "type":"integer"}     
  },
  "required": ["id", "nombre", "status", "curp"]
}



  