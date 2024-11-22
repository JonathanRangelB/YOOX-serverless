export const customer = {
  id: { type: 'integer' },
  nombre: { type: 'string' },
  telefono_fijo: { type: 'string' },
  telefono_movil: { type: 'string' },
  correo_electronico: { type: 'string' },
  observaciones: { type: 'string' },
  id_agente: { type: 'integer' },
  nombre_agente: { type: 'string' },
  ocupacion: { type: 'string' },
  curp: { type: 'string' },
  id_domicilio: { type: 'integer' },
  tipo_calle: { type: 'string' },
  nombre_calle: { type: 'string' },
  numero_exterior: { type: 'string' },
  numero_interior: { type: 'string' },
  colonia: { type: 'string' },
  municipio: { type: 'string' },
  estado: { type: 'string' },
  cp: { type: 'string' },
  referencias: { type: 'string' },
};

export const customerSearchParametersSchema = {
  type: 'object',

  properties: {
    id: { type: 'integer' },
    curp: {
      type: 'string',
      pattern:
        '^([A-Z][AEIOUX][A-Z]{2}\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\\d])(\\d)$',
    },
    nombre: { type: 'string' },
    id_agente: { type: 'integer' }
  },

  required: ['id_agente'],

  anyOf: [
    { required: ['id'] },
    { required: ['curp'] },
    { required: ['nombre'] },
  ],

  additionalProperties: false
}