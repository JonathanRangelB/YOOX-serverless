import { APIGatewayEvent } from 'aws-lambda';
import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { registerPayment } from './registerPayment';
import { PrestamosDetalle } from './types/prestamos_detalle';
import { Prestamos } from './types/prestamos';

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return generateJsonResponse({ message: 'No body provided' }, 400);
  } else {
    const { prestamo, pago } = JSON.parse(event.body) as {
      pago: PrestamosDetalle;
      prestamo: Prestamos;
    };
    const result = await registerPayment(pago, prestamo);
    return generateJsonResponse(result, 200);
  }
};
