import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import { StatusCodes } from '../helpers/statusCodes';

interface TokenPayload {
  ID: number;
  NOMBRE: 'JOSE HERIBERTO SANCHEZ LARIOS';
  ROL: string;
  ACTIVO: boolean;
  ID_GRUPO: number;
  ID_ROL: number;
  iat: number;
  exp: number;
}

interface RefreshRequestBody {
  token: string;
}

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

    // Validar que hay body
    if (!event.body) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    // Parsear body
    const body: RefreshRequestBody = JSON.parse(event.body);

    if (!body.token) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        headers,
        body: JSON.stringify({ error: 'Token is required' }),
      };
    }

    // Obtener el JWT secret del environment
    const JWT_SECRET = process.env.TOKEN_JWT;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    // Decodificar el token SIN verificar expiración
    // Esto permite renovar tokens que están cerca de expirar o recién expirados
    const decodedToken = jwt.decode(body.token) as TokenPayload;

    if (!decodedToken) {
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        headers,
        body: JSON.stringify({ error: 'Invalid token format' }),
      };
    }

    // Verificar que el token no sea demasiado viejo (opcional)
    // Por ejemplo, no permitir renovar tokens de más de 1 hora de expirados
    const now = Math.floor(Date.now() / 1000);
    const maxRefreshWindow = 60 * 60; // 1 hora en segundos

    if (now - decodedToken.exp > maxRefreshWindow) {
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        headers,
        body: JSON.stringify({
          error: 'Token expired beyond refresh window',
        }),
      };
    }

    // Verificar la firma del token original (importante para seguridad)
    try {
      jwt.verify(body.token, JWT_SECRET, { ignoreExpiration: true });
    } catch (error) {
      console.error('Token verification failed:', error);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token signature' }),
      };
    }

    // TODO: Verificar que el usuario no ha sido deshabilitado

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

    const newToken = jwt.sign(newTokenPayload, JWT_SECRET);

    return {
      statusCode: StatusCodes.OK,
      headers,
      body: JSON.stringify({
        token: newToken,
        expiresIn: 30 * 60, // segundos hasta expiración
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
