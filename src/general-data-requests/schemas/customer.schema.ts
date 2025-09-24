import { REGEX_CURP } from "../../helpers/utils";

export const customerSearchParametersSchema = {
  type: "object",

  properties: {
    id: { type: "integer" },
    curp: {
      type: "string",
      pattern: REGEX_CURP,
    },
    nombre: { type: "string" },
    id_agente: { type: "integer" },
  },

  required: ["id_agente"],

  anyOf: [
    { required: ["id"] },
    { required: ["curp"] },
    { required: ["nombre"] },
  ],

  additionalProperties: false,
};
