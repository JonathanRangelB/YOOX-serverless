export const generateJsonResponse = (bodyData: any, statusCode: number) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json', // Establece el Content-Type como JSON
    },
    body: JSON.stringify(bodyData),
  };
};
