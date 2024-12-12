import { APIGatewayEvent } from 'aws-lambda';
import { generateJsonResponse } from '../helpers/generateJsonResponse';

module.exports.handler = async (event: APIGatewayEvent) => {
  const statusCode = 200;

  return generateJsonResponse(
    { message: 'Hola desde viewRequestList.ts', event },
    statusCode
  );
};

