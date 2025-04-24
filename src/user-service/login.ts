import jwt from 'jsonwebtoken';

import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { Credentials } from './types/user-service';
import { validateCredentials } from './validateCredentials';
import { userSchema } from './schemas/userSchema';
import { StatusCodes } from '../helpers/statusCodes';
import { validatePayload } from '../helpers/utils';

const LOGIN_FAILED = { message: 'Login failed, verify your credentials' };

module.exports.handler = async (event: any) => {
  const data: Credentials = JSON.parse(event.body);

  const validData = validatePayload(data, userSchema);

  if (!validData.valid) {
    return generateJsonResponse(
      {
        message: 'Object provided invalid',
        error: validData.error,
        additionalProperties: validData.additionalProperties,
      },
      StatusCodes.BAD_REQUEST
    );
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
