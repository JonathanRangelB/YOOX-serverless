import { APIGatewayEvent } from 'aws-lambda';
import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { registerUpdateLoanRequest } from './loans/registerUpdateLoanRequest';
import { isValidLoanData } from './loans/validateLoanUpdateData';
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
      { message: 'Object provided invalid', errors: validatedData.error },
      StatusCodes.BAD_REQUEST
    );
  }

  const result = await registerUpdateLoanRequest(body);

  if (result.error) {
    return generateJsonResponse(result, StatusCodes.BAD_REQUEST);
  }

  return generateJsonResponse(result, StatusCodes.OK);
};
