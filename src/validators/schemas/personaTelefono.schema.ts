export const customerSearchTelefonoSchema = {
  type: 'object',

  properties: {
    telefono_fijo: {
      type: 'string',
    },

    telefono_movil: {
      type: 'string',
    },

    table: { type: 'string', enum: ['CLIENTES', 'AVALES'] },
  },

  required: ['table', 'telefono_fijo', 'telefono_movil'],

  additionalProperties: false,

  anyOf: [
    { type: 'object', properties: { telefono_fijo: { pattern: '^\\d{10}$' } } },
    {
      type: 'object',
      properties: { telefono_movil: { pattern: '^\\d{10}$' } },
    },
  ],
};
