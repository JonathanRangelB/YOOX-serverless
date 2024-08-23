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

    const { message, err } = await registerPayment(spaAltaPago);
    if (err) {
      return generateJsonResponse({ message, err }, 400);
    }
    return generateJsonResponse({ message }, 200);
  }
};
