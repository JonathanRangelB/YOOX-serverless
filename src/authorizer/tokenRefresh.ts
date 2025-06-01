import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import { StatusCodes } from '../helpers/statusCodes';
import { DbConnector } from '../helpers/dbConnector';
import { RefreshRequestBody, TokenPayload } from './auth.interface';
import { generateJsonResponse } from '../helpers/generateJsonResponse';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Manejar preflight CORS
    if (event.httpMethod === 'OPTIONS') {
      return generateJsonResponse('', StatusCodes.OK);
    }

    if (!event.body) {
      return generateJsonResponse(
        { error: 'Request body is required' },
        StatusCodes.BAD_REQUEST
      );
    }

    const body: RefreshRequestBody = JSON.parse(event.body);

    if (!body.token) {
      return generateJsonResponse(
        { error: 'Token is required' },
        StatusCodes.BAD_REQUEST
      );
    }

    // Obtener el JWT secret del environment
    const TOKEN_JWT = process.env.TOKEN_JWT;
    if (!TOKEN_JWT) {
      throw new Error('JWT_SECRET not configured');
    }

    // Decodificar el token SIN verificar expiración
    const tokenWithoutBearer = body.token.split(' ')[1];
    const decodedToken = jwt.decode(tokenWithoutBearer) as TokenPayload;

    if (!decodedToken) {
      return generateJsonResponse(
        { error: 'Invalid token format' },
        StatusCodes.UNAUTHORIZED
      );
    }

    // Verificar que el token no sea demasiado viejo
    // Por ejemplo, no permitir renovar tokens de más de 1 hora de expirados
    const now = Math.floor(Date.now() / 1000);
    const maxRefreshWindow = 30 * 60; // 30 minutos en segundos

    if (now - decodedToken.exp > maxRefreshWindow) {
      return generateJsonResponse(
        { error: 'Token expired beyond refresh window' },
        StatusCodes.UNAUTHORIZED
      );
    }

    // Verificar la firma del token original
    try {
      jwt.verify(tokenWithoutBearer, TOKEN_JWT, { ignoreExpiration: true });
    } catch (error) {
      console.error('Token verification failed:', error);
      return generateJsonResponse(
        { error: 'Invalid token signature' },
        StatusCodes.UNAUTHORIZED
      );
    }

    // Verificar que el usuario no ha sido deshabilitado
    if (!(await userIsActive(decodedToken.ID))) {
      return generateJsonResponse(
        { error: 'User no longer active, contact support' },
        StatusCodes.UNAUTHORIZED
      );
    }

    // Generar nuevo token con nueva expiración (30 minutos)
    const newTokenPayload: TokenPayload = {
      ID: decodedToken.ID,
      NOMBRE: decodedToken.NOMBRE,
      ROL: decodedToken.ROL,
      ACTIVO: decodedToken.ACTIVO,
      ID_GRUPO: decodedToken.ID_GRUPO,
      ID_ROL: decodedToken.ID_ROL,
      iat: now,
      exp: now + 30 * 60, // 30 minutos desde ahora
    };

    const newToken = jwt.sign(newTokenPayload, TOKEN_JWT);

    return generateJsonResponse(
      {
        token: `Bearer ${newToken}`,
        expiresInSeconds: 30 * 60, // segundos hasta expiración
      },
      StatusCodes.OK
    );
  } catch (error) {
    console.error('Error in refresh token:', { error });

    return generateJsonResponse(
      { error: 'Internal server error' },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

async function userIsActive(ID: number) {
  const con = await DbConnector.getInstance().connection;
  const res = await con.query(
    `SELECT ID FROM USUARIOS WHERE ACTIVO = 1 AND ID = ${ID}`
  );
  if (res.recordset.length === 0) {
    return false;
  }
  return true;
}
