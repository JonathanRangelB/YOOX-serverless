import { DbConnector } from './dbConnector';

export async function getPhoneNumberByPersonId(
  table: 'CLIENTES' | 'USUARIOS',
  id_person: number
): Promise<string> {
  const pool = await DbConnector.getInstance().connection;
  const result = await pool.query<{ TELEFONO_MOVIL: string }>(
    `SELECT TELEFONO_MOVIL from ${table} where ID = ${id_person}`
  );
  return result.recordset[0].TELEFONO_MOVIL;
}
