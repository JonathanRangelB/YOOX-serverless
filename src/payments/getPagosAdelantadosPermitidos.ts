const sql = require('mssql');

export const getPagosAdelantadosPermitidos = async (idCliente: number) => {
  const sqlConfig = {
    user: process.env.USUARIO,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.SERVER,
    options: {
      // encrypt: true, // for azure
      trustServerCertificate: true, // change to true for local dev / self-signed certs
    },
  };

  try {
    // Asegúrate de que cualquier elemento esté correctamente codificado en la cadena de conexión URL
    await sql.connect(sqlConfig);
    const res = await sql.query(
      `
      SELECT * from PAGOS_REGLAS_DIAS prd WHERE id = 0
      SELECT * from PAGOS_REGLAS_DIAS prd WHERE id_cliente = ${idCliente}
      `
    );

    const diasPorDefecto = res.recordsets[0][0].numero_dias / 7;
    const diasDelCliente = res.recordsets[1][0]?.numero_dias / 7;
    await sql.close();

    return !diasDelCliente ? diasPorDefecto : diasDelCliente;
  } catch (err) {
    return { err };
  }
};
