import jwt from "jsonwebtoken";
import {
  JsonWebTokenError,
  TokenExpiredError,
  NotBeforeError,
} from "jsonwebtoken";

import { generateJsonResponse } from "../helpers/generateJsonResponse";
import { StatusCodes } from "../helpers/statusCodes";

module.exports.handler = async (event: any) => {
  const { headers } = event;
  const authToken = headers?.authorization?.split(" ")[1];

  try {
    jwt.verify(authToken, process.env.TOKEN_JWT!);
    return generateJsonResponse({ isValid: true }, StatusCodes.OK);
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      return generateJsonResponse(
        { isValid: false, error: err },
        StatusCodes.UNAUTHORIZED
      );
    }
    if (err instanceof TokenExpiredError) {
      return generateJsonResponse(
        { isValid: false, error: err },
        StatusCodes.BAD_REQUEST
      );
    }
    if (err instanceof NotBeforeError) {
      return generateJsonResponse(
        { isValid: false, error: err },
        StatusCodes.BAD_REQUEST
      );
    }
    return generateJsonResponse(
      { isValid: false, error: err },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
