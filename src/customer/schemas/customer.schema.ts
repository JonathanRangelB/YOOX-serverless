export const customer = {
    id: {	type: "integer" },
    nombre_cliente: { type: "string" },
    apellido_paterno_cliente: { type: "string" },
    apellido_materno_cliente: { type: "string" },
    telefono_fijo: {	type: "string"},
    telefono_movil: {	type: "string"},
    correo_electronico: {	type: "string"},
    activo: {	type: "integer"},
    observaciones: {	type: "string"},
    id_agente: {	type: "integer"},
    ocupacion: {	type: "string"},
    curp: {	type: "string"}, 
    tipo_calle: {	type: "string"},
    nombre_calle: {	type: "string"},
    numero_exterior: {	type: "string"},
    numero_interior: {type: "string"},
    colonia: {	type: "string"},
    municipio: {	type: "string"},
    estado: {	type: "string"},
    cp: {	type: "string"},
    referencias: {	type: "string"},
    created_by: {	type: "integer"},
    created_date: {	type: "string","format": "date"},
    
    required : [
      "nombre_cliente", 
      "apellido_paterno_cliente", 
      "apellido_materno_cliente",       
      "curp", 
      "id_agente", 
      "curp", 
      "created_by",
      "tipo_calle",
      "nombre_calle",
      "numero_exterior",
      "colonia",
      "municipio",
      "estado",
      "cp"
    ]
}

  