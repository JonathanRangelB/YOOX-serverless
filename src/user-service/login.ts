import jwt from 'jsonwebtoken';
import Ajv from 'ajv';

import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { credentials } from './types/user-service';
import { validateCredentials } from './validateCredentials';
import { userSchema } from './schemas/userSchema';

const ajv = new Ajv({ allErrors: true });
const LOGIN_FAILED = { message: 'Login failed, verify your credentials' };

module.exports.handler = async (event: any) => {
  const data: credentials = JSON.parse(event.body);
  const validate = ajv.compile(userSchema);
  const valid = validate(data);
  const errors = ajv.errorsText(validate.errors, { separator: ' AND ' });

  if (!valid) {
    return generateJsonResponse({ errors }, 400);
  }

  const { recordset, rowsAffected } = await validateCredentials(data);
  const rowsAffectedasNumber = rowsAffected[0];

  if (!rowsAffectedasNumber) {
    console.warn(LOGIN_FAILED);
    return generateJsonResponse({ LOGIN_FAILED }, 404);
  }

  const token = jwt.sign(recordset[0], process.env.TOKEN_JWT!, {
    expiresIn: '30m',
  });

  return generateJsonResponse(
    {
      user: recordset[0],
      Autorization: `Bearer ${token}`,
    },
    200
  );
};
