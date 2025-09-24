import { APIGatewayEvent } from "aws-lambda";

import { generateJsonResponse } from "../helpers/generateJsonResponse";
import { registerPayment } from "./registerPayment";
import { SPAltaPago } from "./types/SPAltaPago";

module.exports.handler = async (event: APIGatewayEvent) => {
  let statusCode = 200;
  if (!event.body) {
    return generateJsonResponse({ message: "No body provided" }, 400);
  } else {
    const { spaAltaPago } = JSON.parse(event.body) as {
      spaAltaPago: SPAltaPago;
    };
    const result = await registerPayment(spaAltaPago);
    if (result.err) {
      statusCode = 404;
    }
    return generateJsonResponse(result, statusCode);
  }
};
