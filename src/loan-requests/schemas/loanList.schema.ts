export const loanRequestListSearchParametersSchema = {
  type: 'object',

  properties: {
    id_agente: { type: 'number' },
  },

  required: ['id_agente'],

  additionalProperties: false,
};
