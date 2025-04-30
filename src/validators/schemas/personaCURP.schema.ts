import { REGEX_CURP } from "../../helpers/utils";

export const customerSearchCURPSchema = {
  type: 'object',

  properties: {
    curp: {
      type: 'string',
      pattern: REGEX_CURP
    },
    table: { type: 'string', enum: ['CLIENTES', 'AVALES'] },

    id_persona: {
      anyOf: [
        { type: 'integer' },
        { type: 'integer', enum: ['', null], nullable: true },
      ],
    },
  },

  required: ['curp', 'table'],

  additionalProperties: false,
};
