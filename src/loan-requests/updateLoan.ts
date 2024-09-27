import { APIGatewayEvent } from "aws-lambda";
import { generateJsonResponse } from "../helpers/generateJsonResponse";

module.exports.handler = async (event: APIGatewayEvent) => {
  let statusCode = 200;

  return generateJsonResponse(
    { message: "Hola desde updateLoan.ts" },
    statusCode,
  );
};
