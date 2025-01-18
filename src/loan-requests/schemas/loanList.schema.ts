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
    status: { type: 'string' },
    nombre_cliente: { type: 'string' },
    folio: { type: 'string' },
  },

  required: ['id_usuario', 'rol_usuario', 'offSetRows', 'fetchRowsNumber'],

  additionalProperties: true,
};
