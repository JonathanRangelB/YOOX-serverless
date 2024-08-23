import { APIGatewayEvent } from 'aws-lambda';
import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { registerPayment } from './registerPayment';
import { SPAltaPago } from './types/SPAltaPago';

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return generateJsonResponse({ message: 'No body provided' }, 400);
  } else {
    const { spaAltaPago } = JSON.parse(event.body) as {
      spaAltaPago: SPAltaPago;
    };
    console.log(spaAltaPago);

    const result = await registerPayment(spaAltaPago);
    return generateJsonResponse(result, 200);
  }
};
