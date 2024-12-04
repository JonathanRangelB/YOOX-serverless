export const customerSearchTelefonoSchema = {
  type: 'object',

  properties: {
    telefono_fijo: {
      anyOf: [
        {
          type: 'string', pattern: '^\\d{10}$'
        },
        { type: 'string', enum: ['', null], nullable: true },
      ]
    },

    telefono_movil: {
      anyOf: [
        {
          type: 'string', pattern: '^\\d{10}$'
        },
        { type: 'string', enum: ['', null], nullable: true },
      ]
    },


    table: { type: 'string', enum: ['CLIENTES', 'AVALES'] },
  },

  required: ['table'],

  anyOf: [{ required: ['telefono_fijo'] }, { required: ['telefono_movil'] }],

  additionalProperties: false,
};
