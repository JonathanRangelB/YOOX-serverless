import sql from "mssql";
import { DbConnector } from "../helpers/dbConnector";
import { GenericBDRequest } from "../general-data-requests/types/genericBDRequest";
import { isInvalidID } from "../helpers/utils";

export async function validateUserRole(id_user: number, user_roles: string[]): Promise<GenericBDRequest> {

  if (isInvalidID(id_user)) {
    return {
      generatedId: 0,
      message: "Id de usuario no válido"
    }
  }

  const queryString = `SELECT ID, ROL
                        FROM
                          USUARIOS
                        WHERE
                          ACTIVO = 1
                          AND ID = @idUser
                      `;

  const pool = await DbConnector.getInstance().connection;
  const poolRequest = pool.request();

  poolRequest.input("idUser", sql.Int, id_user);

  const queryResult = await poolRequest.query(queryString);

  const recordSet = queryResult.recordset;

  if (recordSet.length <= 0) {
    return {
      generatedId: 0,
      message: "El usuario no existe o se encuentra inactivo"
    }
  }

  const userRole = recordSet[0].ROL as string;

  if (!user_roles.includes(userRole)) {
    return {
      generatedId: 0,
      message: "El usuario no tiene privilegios para realizar esta operación"
    }
  }

  const userId = +(recordSet[0].ID as string);

  return {
    generatedId: userId,
    message: userRole
  }
}
