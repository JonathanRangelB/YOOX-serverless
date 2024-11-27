import { APIGatewayEvent } from 'aws-lambda';
import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { StatusCodes } from '../helpers/statusCodes';

module.exports.handler = async (event: APIGatewayEvent) => {
  return generateJsonResponse(
    { message: 'Hola validateCURP', event },
    StatusCodes.OK
  );
};
