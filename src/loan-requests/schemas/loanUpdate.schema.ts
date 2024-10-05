import { propertiesForLoanRequest, requiredFielsForUpdateLoanRequest } from "./propertiesForLoanRequest.schema";

export const loanSchema = {
    type: "object",
    properties: propertiesForLoanRequest,
    required: requiredFielsForUpdateLoanRequest,
    additionalProperties: false,
  };