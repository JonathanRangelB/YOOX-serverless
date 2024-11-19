import { APIGatewayEvent } from 'aws-lambda';

import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { registerNewLoanRequest } from './loans/registerNewLoanRequest';
import { isValidLoanData } from './loans/validateLoanData';
import { StatusCodes } from '../helpers/statusCodes';

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return generateJsonResponse(
      { message: 'No body provided' },
      StatusCodes.BAD_REQUEST
    );
  }

  const body = JSON.parse(event.body);

  if (!body) {
    return generateJsonResponse(
      { message: 'No body provided' },
      StatusCodes.BAD_REQUEST
    );
  }

  const validatedData = isValidLoanData(body);

  if (!validatedData.valid) {
    return generateJsonResponse(
      {
        messbge: 'Object provided invalid',
        error: validatedData.error,
        additionalProperties: validatedData.additionalProperties,
      },
      StatusCodes.BAD_REQUEST
    );
  }

  const result = await registerNewLoanRequest(body);
  if (result.error) {
    return generateJsonResponse(result, StatusCodes.BAD_REQUEST);
  }
  return generateJsonResponse(result, StatusCodes.OK);
};
