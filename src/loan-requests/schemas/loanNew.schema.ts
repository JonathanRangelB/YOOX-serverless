import { propertiesForLoanRequest, requiredFielsForNewLoanRequest } from "./propertiesForLoanRequest.schema";

export const loanSchema = {
	type: "object",
	properties: propertiesForLoanRequest,
	required: requiredFielsForNewLoanRequest,
	additionalProperties: false,
};


