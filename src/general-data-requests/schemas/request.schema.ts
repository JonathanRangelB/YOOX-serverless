export const requestDetailSearchParametersSchema = {
  type: "object",

  properties: {
    request_number: { type: "string", pattern: "^[a-zA-Z0-9]{6}$" },
  },

  required: ["request_number"],

  additionalProperties: false,
};
