import { APIGatewayEvent } from "aws-lambda";
import { DbConnector } from "../helpers/dbConnector";
import { generateGetJsonResponse } from "../helpers/generateGetJsonResponse";
import { generateJsonResponse } from "../helpers/generateJsonResponse";
import { StatusCodes } from "../helpers/statusCodes";
import { DesktopVersionData } from "./types/desktopVersionData";

module.exports.handler = async (_: APIGatewayEvent) => {
  try {
    console.log("Iniciando handler");
    const con = await DbConnector.getInstance().connection;
    console.log("Conexion obtenida");
    const res = await con.query<DesktopVersionData>(
      "SELECT TOP 1 [PUBLISH_URL] as [url] FROM SEC_VERSION sv ORDER BY sv.ID_VERSION DESC"
    );
    console.log("Query ejecutado", JSON.stringify(res.recordset));
    if (res.recordset.length === 0) {
      return generateJsonResponse(
        { error: "Query throw no data" },
        StatusCodes.NOT_FOUND
      );
    }
    const response = generateGetJsonResponse(res.recordset[0], StatusCodes.OK);
    console.log("Respuesta generada", JSON.stringify(response));
    return response;
  } catch (error) {
    console.error("Error capturado", JSON.stringify(error));
    return generateJsonResponse(error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
