import Ajv from "ajv";
import formats from "ajv-formats";

import { loanSchema } from "../schemas/loan.schema";
import { SPInsertNewLoanRequest } from "../types/SPInsertNewLoanRequest";
import { validateLoanResponse } from "./validateLoanResponse";

const ajv = new Ajv({ allErrors: true });
formats(ajv);

export function isValidLoanData(
  spInsertNewLoanRequest: SPInsertNewLoanRequest,
): validateLoanResponse {
  const validate = ajv.compile(loanSchema);
  const valid = validate(spInsertNewLoanRequest);
  const errors = ajv.errorsText(validate.errors, { separator: " AND " });

  if (!valid) {
    return { valid: false, errors };
  }

  return { valid: true };
}

