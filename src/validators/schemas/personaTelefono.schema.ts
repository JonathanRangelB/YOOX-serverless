export const customerSearchTelefonoSchema = {
  type: 'object',

  properties: {
    telefono_fijo: {
      type: 'string',
      pattern: '^\\d{10}$',
    },

    telefono_movil: {
      type: 'string',
      pattern: '^\\d{10}$',
    },

    table: { type: 'string', enum: ['CLIENTES', 'AVALES'] },

    id_persona: { type: 'integer' },
  },

  required: ['table'],
  additionalProperties: false,
};
