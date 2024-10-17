import { APIGatewayEvent } from 'aws-lambda';

import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { registerNewLoanRequest } from './loans/registerNewLoanRequest';
import { isValidLoanData } from './loans/validateLoanData';
import { SPInsertNewLoanRequest } from './types/SPInsertNewLoanRequest';

module.exports.handler = async (event: APIGatewayEvent) => {
  let statusCode = 200;

  if (!event.body) {
    return generateJsonResponse({ message: 'No body provided' }, 400);
  }

  const { spInsertNewLoanRequest } = JSON.parse(event.body) as {
    spInsertNewLoanRequest: SPInsertNewLoanRequest;
  };

  console.table(spInsertNewLoanRequest);

  if (!spInsertNewLoanRequest) {
    return generateJsonResponse(
      { message: 'spInsertNewLoanRequest is not defined' },
      400
    );
  }

  const validatedData = isValidLoanData(spInsertNewLoanRequest);

  if (!validatedData.valid) {
    return generateJsonResponse(
      { message: 'Object provided invalid', errors: validatedData.errors },
      400
    );
  }

  const result = await registerNewLoanRequest(spInsertNewLoanRequest);
  if (result.error) {
    statusCode = 400;
  }
  return generateJsonResponse(result, statusCode);
};
