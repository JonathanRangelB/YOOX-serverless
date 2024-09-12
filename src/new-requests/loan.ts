import { APIGatewayEvent } from "aws-lambda";
import { generateJsonResponse } from "../helpers/generateJsonResponse";

module.exports.handler = async (event: APIGatewayEvent) => {
  let statusCode = 400;
  return generateJsonResponse(
    { message: "hola mundo desde loan-request" },
    statusCode,
  );
};
