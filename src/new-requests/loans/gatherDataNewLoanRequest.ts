import { DbConnector } from "../../helpers/dbConnector";

export const getLastLoadId = async () => {
  try {
    const pool = await DbConnector.getInstance().connection;
    // Asegúrate de que cualquier elemento esté correctamente codificado en la cadena de conexión URL
    const idLoadQuery = pool
      .request()
      .query(
        `SELECT MAX(ID), GETDATE() FROM LOAN_REQUEST;`
      );

    // colocar el tipo de dato que se espera en la respuesta, para prestamo colocar Prestamos y para prestamoDetalle PrestamosDetalle
    const [lastLoanId] = await Promise.all([
        idLoadQuery,
    ]);
    return { lastLoanId };
  } catch (err) {
    return { err };
  }
};
