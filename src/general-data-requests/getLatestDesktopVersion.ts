import { APIGatewayEvent } from "aws-lambda";
import { generateJsonResponse } from "../helpers/generateJsonResponse";
import { StatusCodes } from "../helpers/statusCodes";
import { DbConnector } from "../helpers/dbConnector";
import { DesktopVersionData } from "./types/desktopVersionData";
import { generateGetJsonResponse } from "../helpers/generateGetJsonResponse";

module.exports.handler = async (_: APIGatewayEvent) => {
  try {
    const con = await DbConnector.getInstance().connection;
    const res = await con.query<DesktopVersionData>(
      `SELECT TOP 1 * FROM SEC_VERSION sv ORDER BY sv.ID_VERSION DESC`
    );
    if (res.recordset.length === 0) {
      return generateJsonResponse(
        { error: "Query throw no data" },
        StatusCodes.NOT_FOUND
      );
    }
    return generateGetJsonResponse(res.recordset[0], StatusCodes.OK);
  } catch (error) {
    return generateJsonResponse(error, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
