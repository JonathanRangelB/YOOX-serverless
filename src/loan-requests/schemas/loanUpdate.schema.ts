import {
  propertiesForLoanRequest,
  requiredFielsForUpdateLoanRequest,
  validateStartDate,
} from "./propertiesForLoanRequest.schema";

export const loanSchema = {
  type: "object",
  properties: propertiesForLoanRequest,
  ...validateStartDate,
  required: requiredFielsForUpdateLoanRequest,
  additionalProperties: false,
};
