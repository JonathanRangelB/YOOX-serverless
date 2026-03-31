import {
  propertiesForLoanRequest,
  requiredFielsForNewLoanRequest,
  validateStartDate,
} from "./propertiesForLoanRequest.schema";

export const loanSchema = {
  type: "object",
  properties: propertiesForLoanRequest,
  ...validateStartDate,
  required: requiredFielsForNewLoanRequest,
  additionalProperties: false,
};
