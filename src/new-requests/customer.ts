import { APIGatewayEvent } from "aws-lambda";
import { generateJsonResponse } from "../helpers/generateJsonResponse";

module.exports.handler = async (event: APIGatewayEvent) => {
  let statusCode = 200;
  return generateJsonResponse(
    {
      message: "hola mundo desde customer-request",
      custom: "dato cualquiera",
      id_personalizado: 2,
      objetoCualquiera: { nombre: "Jonathan", edad: 35 },
    },
    statusCode,
  );
};
