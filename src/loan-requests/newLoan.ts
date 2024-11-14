import { APIGatewayEvent } from 'aws-lambda';

import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { registerNewLoanRequest } from './loans/registerNewLoanRequest';
import { isValidLoanData } from './loans/validateLoanData';

module.exports.handler = async (event: APIGatewayEvent) => {
  let statusCode = 200;

  if (!event.body) {
    return generateJsonResponse({ message: 'No body provided' }, 400);
  }

  const body = JSON.parse(event.body);

  if (!body) {
    return generateJsonResponse({ message: 'No body provided' }, 400);
  }

  const validatedData = isValidLoanData(body);

  if (!validatedData.valid) {
    return generateJsonResponse(
      {
        message: 'Object provided invalid',
        error: validatedData.error,
        additionalProperties: validatedData.additionalProperties,
      },
      400
    );
  }

  const result = await registerNewLoanRequest(body);
  if (result.error) {
    statusCode = 400;
  }
  return generateJsonResponse(result, statusCode);
};
