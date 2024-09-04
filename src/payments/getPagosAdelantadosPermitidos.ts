import { DbConnector } from "../helpers/dbConnector"
import { pagos_reglas_dias } from "../helpers/tablesSchemas/tables";

export const getPagosAdelantadosPermitidos = async (idCliente: number) => {
  try {
    // Asegúrate de que cualquier elemento esté correctamente codificado en la cadena de conexión URL
    const pool = await DbConnector.getInstance().connection
    const res = await pool.query < pagos_reglas_dias[] > (
      `
      SELECT * from PAGOS_REGLAS_DIAS prd WHERE id = 0
      SELECT * from PAGOS_REGLAS_DIAS prd WHERE id_cliente = ${idCliente}
      `
    );
    const diasPorDefecto = res.recordsets[0][0].numero_dias / 7;
    const diasDelCliente = res.recordsets[1][0]?.numero_dias / 7;

    return !diasDelCliente ? diasPorDefecto : diasDelCliente;
  } catch (err) {
    return { err };
  }
};
