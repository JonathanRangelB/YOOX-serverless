import { DbConnector } from "../helpers/dbConnector";

interface WhatsappMessageDTO {
  message: string;
  queue_ISOdate: string; // ISO 8601 format
  target_phone_number: string;
}

export async function enqueueWAMessageOnDB(options: WhatsappMessageDTO) {
  const pool = await DbConnector.getInstance().connection;
  const queryStatement = `
    INSERT INTO [WHATSAPP_QUEUE] (
      [MESSAGE],
      [QUEUE_DATE],
      [TARGET_PHONE_NUMBER])
    VALUES (
      '${options.message}',
      '${options.queue_ISOdate}',
      '${options.target_phone_number}')`;
  const result = await pool.query(queryStatement);
  return result.rowsAffected[0];
}
