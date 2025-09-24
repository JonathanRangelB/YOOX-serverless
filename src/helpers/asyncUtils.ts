import { DbConnector } from "./dbConnector";

interface WaErrorOptions {
  uuid: string;
  timestamp_sent: Date;
  sent_to: string;
  type: string;
  message: string;
  origin: string;
  error_message: string;
}

export async function getPhoneNumberByPersonId(
  table: "CLIENTES" | "USUARIOS",
  id_person: number
) {
  try {
    const pool = await DbConnector.getInstance().connection;
    const result = await pool.query<{ TELEFONO_MOVIL: string }>(
      `SELECT TELEFONO_MOVIL from ${table} where ID = ${id_person}`
    );
    return result.recordset[0].TELEFONO_MOVIL;
  } catch (err) {
    console.error(err);
  }
}

// export async function getPhoneNumberInLoanRequestByRequestNumber(
//   request_number: string
// ) {
//   try {
//     const pool = await DbConnector.getInstance().connection;
//     const result = await pool.query<{ TELEFONO_MOVIL_CLIENTE: string }>(
//       `SELECT TELEFONO_MOVIL_CLIENTE from LOAN_REQUEST where REQUEST_NUMBER = ${request_number}`
//     );
//     return result.recordset[0].TELEFONO_MOVIL_CLIENTE || '';
//   } catch (err) {
//     console.error(err);
//   }
// }

export async function registerWAErrorInDB(options: WaErrorOptions) {
  const queryStatement = `
    INSERT INTO [MSG_WA] (
      [UUID],
      [TIMESTAMP_SENT],
      [SENT_TO],
      [TYPE],
      [MESSAGE],
      [ORIGIN],
      [ERROR_MESSAGE])
    VALUES (
      '${options.uuid}',
      '${options.timestamp_sent}',
      '${options.sent_to}',
      '${options.type}',
      '${options.message}',
      '${options.origin}',
      '${options.error_message}')`;
  const pool = await DbConnector.getInstance().connection;
  await pool.query(queryStatement);
  return;
}

/**
 * Como su nombre lo indica, esta funcion obtiene los datos de cualquier tipo de query
 * Es necesario enviar la interfaz de tipo de dato que se espera obtener, Ejemplo:
 * const result = await genericQuery<{ NOMBRE: string }>(`SELECT NOMBRE FROM CLIENTES WHERE ID = 1`);
 * @param {string} query - es el query que se desea ejecutar
 */
export async function genericQuery<T>(query: string) {
  const pool = await DbConnector.getInstance().connection;
  const result = await pool.query<T>(query);
  return result.recordset[0];
}
