import { DbConnector } from '../helpers/dbConnector';
import { ClienteDomicilio, DatosCliente } from './types/getCustomer.interface';

module.exports.handler = async (event: any) => {
  const { id, curp, nombre } = JSON.parse(event.body) as DatosCliente;

  try {
    const pool = await DbConnector.getInstance().connection;

    // Asegúrate de que cualquier elemento esté correctamente codificado en la cadena de conexión URL
    const registrosEncontrados = await pool
      .request()
      .query<ClienteDomicilio>(
        `select top 2 P.*, C.NOMBRE as NOMBRE_CLIENTE from PRESTAMOS P inner join CLIENTES C on P.ID_CLIENTE = C.ID  ;`
      );

    return { registrosEncontrados };
  } catch (err) {
    return { err };
  }

}