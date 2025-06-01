import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import { StatusCodes } from '../helpers/statusCodes';
import { DbConnector } from '../helpers/dbConnector';
import { RefreshRequestBody, TokenPayload } from './auth.interface';

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  // Headers CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  };

  try {
    // Manejar preflight CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: StatusCodes.OK,
        headers,
        body: '',
      };
    }

    if (!event.body) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const body: RefreshRequestBody = JSON.parse(event.body);

    if (!body.token) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        headers,
        body: JSON.stringify({ error: 'Token is required' }),
      };
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
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        headers,
        body: JSON.stringify({ error: 'Invalid token format' }),
      };
    }

    // Verificar que el token no sea demasiado viejo
    // Por ejemplo, no permitir renovar tokens de más de 1 hora de expirados
    const now = Math.floor(Date.now() / 1000);
    const maxRefreshWindow = 30 * 60; // 30 minutos en segundos

    if (now - decodedToken.exp > maxRefreshWindow) {
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        headers,
        body: JSON.stringify({
          error: 'Token expired beyond refresh window',
        }),
      };
    }

    // Verificar la firma del token original
    try {
      jwt.verify(tokenWithoutBearer, TOKEN_JWT, { ignoreExpiration: true });
    } catch (error) {
      console.error('Token verification failed:', error);
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        headers,
        body: JSON.stringify({ error: 'Invalid token signature' }),
      };
    }

    // Verificar que el usuario no ha sido deshabilitado
    if (!(await userIsActive(decodedToken.ID))) {
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        headers,
        body: JSON.stringify({
          error: 'User no longer active, contact support',
        }),
      };
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

    return {
      statusCode: StatusCodes.OK,
      headers,
      body: JSON.stringify({
        token: `Bearer ${newToken}`,
        expiresInSeconds: 30 * 60, // segundos hasta expiración
      }),
    };
  } catch (error) {
    console.error('Error in refresh token:', { error });

    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
      }),
    };
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
