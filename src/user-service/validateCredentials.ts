import md5 from 'md5';
import { credentials } from './types/user-service';
import { DbConnector } from '../helpers/dbConnector';

export const validateCredentials = async (data: credentials) => {
  const { userId, password } = data;
  const md5Password = md5(password);
  try {
    // make sure that any items are correctly URL encoded in the connection string
    const pool = await DbConnector.getInstance().connection;
    return await pool.query`SELECT ID, NOMBRE, ROL, ACTIVO, ID_GRUPO, ID_ROL FROM USUARIOS WHERE LOGIN=${userId} AND PASSWORD=${md5Password} AND ACTIVO=1`;
  } catch (err) {
    return { err };
  }
};
