import Ajv from 'ajv';
import formats from 'ajv-formats';

import { loanSchema } from '../schemas/loanUpdate.schema';
import { InsertNewLoanRequest } from '../types/SPInsertNewLoanRequest';
import { validateLoanResponse } from '../types/validateLoanResponse';

const ajv = new Ajv({ allErrors: true });
formats(ajv);

export function isValidLoanData(
  spInsertNewLoanRequest: InsertNewLoanRequest
): validateLoanResponse {
  const validate = ajv.compile(loanSchema);
  const valid = validate(spInsertNewLoanRequest);
  const error = ajv.errorsText(validate.errors, { separator: ' AND ' });

  if (!valid) {
    return { valid, error };
  }

  return { valid };
}
