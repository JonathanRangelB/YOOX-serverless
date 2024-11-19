import Ajv from 'ajv';
import formats from 'ajv-formats';

import { loanSchema } from '../schemas/loanNew.schema';
import { InsertNewLoanRequest } from '../types/SPInsertNewLoanRequest';
import {
  AdditionalProperties,
  validateLoanResponse,
} from '../types/validateLoanResponse';

const ajv = new Ajv({ allErrors: true });
formats(ajv);

export function isValidLoanData(
  insertNewLoanRequest: InsertNewLoanRequest
): validateLoanResponse {
  const validate = ajv.compile(loanSchema);
  const valid = validate(insertNewLoanRequest);
  const error = ajv.errorsText(validate.errors, { separator: ' AND ' });
  const additionalProperties: AdditionalProperties[] = [];
  if (validate.errors) {
    additionalProperties.push(
      ...validate.errors
        .filter((error) => error.keyword === 'additionalProperties')
        .map((error) => ({
          propiedad: error.params.additionalProperty as string,
          path: error.instancePath || 'raíz del objeto',
        }))
    );
  }

  if (!valid) {
    return { valid, error, additionalProperties };
  }
  return { valid };
}
