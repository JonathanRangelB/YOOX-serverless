const jwt = require('jsonwebtoken');
import {
  JsonWebTokenError,
  TokenExpiredError,
  NotBeforeError,
} from 'jsonwebtoken';

import { generateJsonResponse } from '../helpers/generateJsonResponse';

module.exports.handler = async (event: any) => {
  const { headers } = event;
  const authToken = headers?.authorization?.split(' ')[1];

  try {
    var decoded = jwt.verify(authToken, process.env.TOKEN_JWT);
    return generateJsonResponse({ isValid: true }, 200);
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      return generateJsonResponse({ isValid: false, error: err.message }, 401);
    }
    if (err instanceof TokenExpiredError) {
      return generateJsonResponse({ isValid: false, error: err.message }, 400);
    }
    if (err instanceof NotBeforeError) {
      return generateJsonResponse({ isValid: false, error: err.message }, 400);
    }
    return generateJsonResponse({ isValid: false, error: err }, 500);
  }
};
