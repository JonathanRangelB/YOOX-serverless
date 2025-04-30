import { REGEX_CURP } from "../../helpers/utils";

export const guarantorSearchParametersSchema = {
  type: 'object',

  properties: {
    id: {
      type: 'string',
      nullable: true,
    },
    curp: {
      type: 'string',
      nullable: true,
      pattern: REGEX_CURP
    },
    nombre: {
      type: 'string',
      nullable: true,
    },
  },
  additionalProperties: false,
};
