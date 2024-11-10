export const FileDataSchema = {
  type: 'object',
  properties: {
    filename: { type: 'string' },
    path: { type: 'string' },
  },
  required: ['filename', 'path'],
  additionalProperties: false,
};
