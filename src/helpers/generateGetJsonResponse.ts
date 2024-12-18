import { StatusCodes } from './statusCodes';

export const generateGetJsonResponse = (
  bodyData: any,
  statusCode: StatusCodes
) => {
  const sixHoursInSeconds = 6 * 60 * 60;
  const expires = new Date(
    new Date().getTime() + sixHoursInSeconds * 1000
  ).toUTCString();

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${sixHoursInSeconds}`, // Controla la duración del caché
      Expires: expires, // Fecha exacta de expiración
    },
    body: JSON.stringify(bodyData),
  };
};
