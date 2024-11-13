import Ajv from 'ajv';
import formats from 'ajv-formats';

import { loanSchema } from '../schemas/loanNew.schema';
import { InsertNewLoanRequest } from '../types/SPInsertNewLoanRequest';
import { validateLoanResponse } from '../types/validateLoanResponse';

const ajv = new Ajv({ allErrors: true });
formats(ajv);

export function isValidLoanData(
  insertNewLoanRequest: InsertNewLoanRequest
): validateLoanResponse {
  const validate = ajv.compile(loanSchema);
  const valid = validate(insertNewLoanRequest);
  const errors = ajv.errorsText(validate.errors, { separator: ' AND ' });

  if (!valid) {
    return { valid, errors };
  }
  return { valid };
}
