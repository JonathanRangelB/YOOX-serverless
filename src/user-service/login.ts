import jwt from 'jsonwebtoken';
import Ajv from 'ajv';

import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { credentials } from './types/user-service';
import { validateCredentials } from './validateCredentials';
import { userSchema } from './schemas/userSchema';
import { StatusCodes } from '../helpers/statusCodes';

const ajv = new Ajv({ allErrors: true });
const LOGIN_FAILED = { message: 'Login failed, verify your credentials' };

module.exports.handler = async (event: any) => {
  const data: credentials = JSON.parse(event.body);
  const validate = ajv.compile(userSchema);
  const valid = validate(data);
  const errors = ajv.errorsText(validate.errors, { separator: ' AND ' });

  if (!valid) {
    return generateJsonResponse({ errors }, StatusCodes.BAD_REQUEST);
  }

  try {
    const { recordset, rowsAffected } = await validateCredentials(data);

    if (!rowsAffected[0]) {
      console.warn(LOGIN_FAILED);
      return generateJsonResponse(LOGIN_FAILED, StatusCodes.NOT_FOUND);
    }

    const token = jwt.sign(recordset[0], process.env.TOKEN_JWT!, {
      expiresIn: '30m',
    });

    return generateJsonResponse(
      {
        user: recordset[0],
        Autorization: `Bearer ${token}`,
      },
      StatusCodes.OK
    );
  } catch (error) {
    return generateJsonResponse(error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
