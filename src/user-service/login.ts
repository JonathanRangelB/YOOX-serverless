import jwt from 'jsonwebtoken';

import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { Credentials } from './types/user-service';
import { validateCredentials } from './validateCredentials';
import { userSchema } from './schemas/userSchema';
import { StatusCodes } from '../helpers/statusCodes';
import { validatePayload } from '../helpers/utils';

module.exports.handler = async (event: any) => {
  const data: Credentials = JSON.parse(event.body);

  const validData = validatePayload(data, userSchema);

  const TOKEN_JWT = process.env.TOKEN_JWT;
  if (!TOKEN_JWT) {
    throw new Error('JWT_SECRET not configured');
  }

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
      return generateJsonResponse(
        'Login failed, verify your credentials',
        StatusCodes.NOT_FOUND
      );
    }

    const token = jwt.sign(recordset[0], TOKEN_JWT, {
      expiresIn: '60m',
    });

    return generateJsonResponse(
      {
        token: `Bearer ${token}`,
      },
      StatusCodes.OK
    );
  } catch (error) {
    return generateJsonResponse(error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
