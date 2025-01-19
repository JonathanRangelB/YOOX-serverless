// TODO: Hacer las correcciones para los campos requeridos
import { propertiesForLoanRequest } from './propertiesForLoanRequest.schema';
import { requiredFielsForNewLoanRequest } from './propertiesForLoanRequest.schema';

export const loanSchema = {
  type: 'object',
  properties: propertiesForLoanRequest,
  required: requiredFielsForNewLoanRequest,
  additionalProperties: false,
};
