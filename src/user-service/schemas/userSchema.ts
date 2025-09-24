export const userSchema = {
  type: "object",
  properties: {
    userId: {
      type: "string",
    },
    password: {
      type: "string",
    },
  },
  required: ["userId", "password"],
  additionalProperties: false,
};
