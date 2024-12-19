export const loanRequestListSearchParametersSchema = {
  type: 'object',

  properties: {
    id_usuario: { type: 'number' },
    rol_usuario: {
      type: 'string',
      enum: ['Administrador', 'Cobrador', 'Líder de grupo', 'Usuario normal'],
    },
    offSetRows: { type: 'number' },
    fetchRowsNumber: { type: 'number' },
  },

  required: ['id_usuario', 'rol_usuario', 'offSetRows', 'fetchRowsNumber'],

  additionalProperties: false,
};
