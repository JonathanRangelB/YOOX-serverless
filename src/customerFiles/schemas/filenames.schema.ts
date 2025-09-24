export const FileNamesSchema = {
  type: "object",
  properties: {
    filenames: { type: "array", items: { type: "string" }, maxItems: 10 },
  },
  required: ["filenames"],
  additionalProperties: false,
};
