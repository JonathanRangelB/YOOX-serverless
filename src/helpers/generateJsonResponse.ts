import { StatusCodes } from './statusCodes';

export const generateJsonResponse = (
  bodyData: any,
  statusCode: StatusCodes
) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json', // Establece el Content-Type como JSON
    },
    body: JSON.stringify(bodyData),
  };
};
