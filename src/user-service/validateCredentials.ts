import md5 from "md5";
import { Credentials } from "./types/user-service";
import { DbConnector } from "../helpers/dbConnector";

export const validateCredentials = async (data: Credentials) => {
  const { userId, password } = data;
  const md5Password = md5(password);
  const pool = await DbConnector.getInstance().connection;
  return pool.query`SELECT ID, NOMBRE, ROL, ACTIVO, ID_GRUPO, ID_ROL FROM USUARIOS WHERE LOGIN=${userId} AND PASSWORD=${md5Password} AND ACTIVO=1`;
};
