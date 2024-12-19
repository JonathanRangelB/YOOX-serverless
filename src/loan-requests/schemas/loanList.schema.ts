export const loanRequestListSearchParametersSchema = {
  type: 'object',

  properties: {
    id_usuario: { type: 'number' },
    rol_usuario: {
      type: 'string',
      enum: ['Administrador', 'Cobrador', 'Líder de grupo', 'Usuario normal'],
    },
  },

  required: ['id_usuario', 'rol_usuario'],

  additionalProperties: false,
};
