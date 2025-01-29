import { StatusCodes } from './statusCodes';

export const generateGetJsonResponse = (
  bodyData: any,
  statusCode: StatusCodes
) => {
  const oneMinuteInSeconds = 60;
  const expires = new Date(new Date().getTime() + oneMinuteInSeconds * 1000);

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, must-revalidate, max-age=${oneMinuteInSeconds}`, // Controla la duración del caché
      Expires: expires, // Fecha exacta de expiración
    },
    body: JSON.stringify(bodyData),
  };
};
