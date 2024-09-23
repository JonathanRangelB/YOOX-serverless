import { SPInsertNewLoanRequest } from "../types/SPInsertNewLoanRequest";
import Ajv from "ajv";
import { validateLoanResponse } from "./validateLoanResponse";

//const loanSchema = require("../schemas/loan.schema.json")
import { loanSchema } from "../schemas/loan.schema";
const ajv = new Ajv({ allErrors: true });


export function isValidLoanData(spInsertNewLoanRequest : SPInsertNewLoanRequest) : validateLoanResponse {

    const validate = ajv.compile(loanSchema);
    const valid = validate(spInsertNewLoanRequest);
    const errors = ajv.errorsText(validate.errors, { separator: " AND " });


    if (!valid) {
        return {valid : false, errors}
      }

    return { valid : true }

}