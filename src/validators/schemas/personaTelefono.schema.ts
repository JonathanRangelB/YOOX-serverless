export const customerSearchTelefonoSchema = {
  type: 'object',

  properties: {
    telefono_fijo: { type: 'string', pattern: '^\\d{10}$' },
    telefono_movil: { type: 'string', pattern: '^\\d{10}$' },
    table: { type: 'string', enum: ['CLIENTES', 'AVALES'] },
  },

  required: ['table'],

  anyOf: [{ required: ['telefono_fijo'] }, { required: ['telefono_movil'] }],

  additionalProperties: false,
};
