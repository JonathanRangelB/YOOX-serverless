import { APIGatewayRequestAuthorizerEventV2 } from "aws-lambda";
import jwt from "jsonwebtoken";

module.exports.handler = async (event: APIGatewayRequestAuthorizerEventV2) => {
  const { headers } = event;
  const authToken = headers?.authorization?.split(" ")[1];

  console.log("Token recibido:", authToken ? "existe" : "no existe");

  if (!authToken) {
    console.error("Token no encontrado");
    return { isAuthorized: false };
  }

  try {
    const decoded = jwt.verify(authToken, process.env.TOKEN_JWT!);
    console.log("Token válido, decoded:", JSON.stringify(decoded));
    return { isAuthorized: true };
  } catch (err) {
    console.error("Token inválido:", JSON.stringify(err));
    return { isAuthorized: false };
  }
};
