import { APIGatewayEvent } from "aws-lambda";
import { generateJsonResponse } from "../helpers/generateJsonResponse";

module.exports.handler = async (event: APIGatewayEvent) => {
  return generateJsonResponse({ message: "holawa desde getFile" }, 200);
};
