import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { credentials } from './types/user-service';
import { validateCredentials } from './validateCredentials';

const Ajv = require("ajv")
const ajv = new Ajv({ allErrors: true })
const userSchema = require('./schemas/user.schema.json')
const LOGIN_FAILED = { message: "Login failed, verify your credentials" }

module.exports.handler = async (event: any) => {
  const data: credentials = JSON.parse(event.body)
  const validate = ajv.compile(userSchema)
  const valid = validate(data)
  const errors = ajv.errorsText(validate.errors, { separator: " AND " })

  if (!valid) {
    console.log(errors);
    return generateJsonResponse(errors, 400)
  }

  const { recordset, rowsAffected } = await validateCredentials(data);
  const rowsAffectedasNumber = rowsAffected[0]

  if (!rowsAffectedasNumber) {
    console.warn(LOGIN_FAILED);
    return generateJsonResponse(LOGIN_FAILED, 404)
  }

  return generateJsonResponse({
    recordset,
    rowsAffected: rowsAffectedasNumber
  }, 200)
};
