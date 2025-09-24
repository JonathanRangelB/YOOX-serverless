import { APIGatewayEvent } from "aws-lambda";

import { DbConnector } from "../helpers/dbConnector";
import { StatusCodes } from "../helpers/statusCodes";
import { generateGetJsonResponse } from "../helpers/generateGetJsonResponse";
import { CustomerLoanStatus } from "./types/customerLoanStatus.types";
import { generateJsonResponse } from "../helpers/generateJsonResponse";

module.exports.handler = async (event: APIGatewayEvent) => {
  try {
    const loanid = event.queryStringParameters?.loanid;
    const apellido_paterno_cliente = event.queryStringParameters?.apellido;
    if (!loanid || !apellido_paterno_cliente)
      throw new Error("Parametros incompletos");
    const pool = await DbConnector.getInstance().connection;
    const query = `
    SELECT
        l.request_number,
        l.loan_request_status,
        u.nombre AS nombre_agente,
        l.nombre_cliente,
        l.apellido_paterno_cliente,
        l.apellido_materno_cliente,
        l.nombre_aval,
        l.apellido_paterno_aval,
        l.apellido_materno_aval,
        l.cantidad_prestada,
        l.fecha_inicial
    FROM
        LOAN_REQUEST l
    JOIN
        usuarios u ON l.id_agente = u.id
    WHERE
        l.request_number = '${loanid}' AND
        l.apellido_paterno_cliente = '${apellido_paterno_cliente}'`;
    const result = await pool.query<CustomerLoanStatus>(query);
    if (result.recordset.length == 0)
      throw new Error("No se encontraron registros");

    return generateGetJsonResponse(result.recordset[0], StatusCodes.OK);
  } catch (err) {
    if (err instanceof Error) {
      return generateJsonResponse(err.message, StatusCodes.BAD_REQUEST);
    }
  }
};
