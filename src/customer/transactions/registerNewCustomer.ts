import { Int, Table, VarChar, Transaction, Bit, DateTime } from 'mssql';
import {
  indexes_id,
  customer_request,
  address,
} from '../../helpers/table-schemas';
import { customerReqResponse } from '../types/customerRequest';

export const registerNewCustomer = async (
  customerObject: customer_request,
  addressObject: address,
  procTransaction: Transaction
): Promise<customerReqResponse> => {
  
  console.log("INICIA transaccion ALTA de CLIENTE")

  let message = '';
  let lastCustomerId = 0;

  try {
    const nextIdQuery = await procTransaction
      .request()
      .query<indexes_id>(
        `SELECT [objeto], [indice] FROM [INDICES] WHERE OBJETO IN ('ID_CLIENTE', 'ID_DOMICILIO') ORDER BY OBJETO; `
      );

      console.table(nextIdQuery)

    lastCustomerId = nextIdQuery.recordset[0].indice;
    const lastAddressId = nextIdQuery.recordset[1].indice;

    console.log("lastCustomerId: " + lastCustomerId)
    console.log("lastAddressId: " + lastAddressId)

    const tableCustomerBD = new Table('CLIENTES');
    const tableAddressBD = new Table('DOMICILIOS');
    const tableAddressSuiteNumberBD = new Table('DOMICILIOS_NUM_INTERIOR');

    tableCustomerBD.create = false;
    tableAddressBD.create = false;
    tableAddressSuiteNumberBD.create = false;

    tableCustomerBD.columns.add('ID', Int, { nullable: false });
    tableCustomerBD.columns.add('NOMBRE', VarChar, { nullable: false });
    tableCustomerBD.columns.add('TELEFONO_FIJO', VarChar, { nullable: true });
    tableCustomerBD.columns.add('TELEFONO_MOVIL', VarChar, { nullable: true });
    tableCustomerBD.columns.add('NUMERO_EXTERIOR', VarChar, { nullable: false });
    tableCustomerBD.columns.add('NUMERO_INTERIOR', VarChar, { nullable: false });
    tableCustomerBD.columns.add('CORREO_ELECTRONICO', VarChar, {
      nullable: true,
    });
    tableCustomerBD.columns.add('ACTIVO', Bit, { nullable: true });
    tableCustomerBD.columns.add('CLASIFICACION', VarChar, { nullable: true });
    tableCustomerBD.columns.add('OBSERVACIONES', VarChar, { nullable: true });
    tableCustomerBD.columns.add('ID_AGENTE', Int, { nullable: true });
    tableCustomerBD.columns.add('OCUPACION', VarChar, { nullable: true });
    tableCustomerBD.columns.add('CURP', VarChar, { nullable: false });
    tableCustomerBD.columns.add('ID_DOMICILIO', Int, { nullable: true });

    tableAddressBD.columns.add('ID', Int, { nullable: false });
    tableAddressBD.columns.add('TIPO_CALLE', VarChar, { nullable: true });
    tableAddressBD.columns.add('NOMBRE_CALLE', VarChar, { nullable: true });
    tableAddressBD.columns.add('NUMERO_EXTERIOR', VarChar, { nullable: true });
    tableAddressBD.columns.add('COLONIA', VarChar, { nullable: true });
    tableAddressBD.columns.add('MUNICIPIO', VarChar, { nullable: true });
    tableAddressBD.columns.add('ESTADO', VarChar, { nullable: true });
    tableAddressBD.columns.add('CP', VarChar, { nullable: true });
    tableAddressBD.columns.add('REFERENCIAS', VarChar, { nullable: true });
    tableAddressBD.columns.add('CREATED_BY_USR', Int, { nullable: true });
    tableAddressBD.columns.add('CREATED_DATE', DateTime, { nullable: true });
    tableAddressBD.columns.add('MODIFIED_BY_USR', Int, { nullable: true });
    tableAddressBD.columns.add('MODIFIED_DATE', DateTime, { nullable: true });

    tableAddressSuiteNumberBD.columns.add('ID_DOMICILIO', Int, {
      nullable: false,
    });
    tableAddressSuiteNumberBD.columns.add('NUMERO_INTERIOR', VarChar, {
      nullable: false,
    });
    tableAddressSuiteNumberBD.columns.add('ID_CLIENTE', Int, {
      nullable: true,
    });
    tableAddressSuiteNumberBD.columns.add('TIPO', VarChar, { nullable: true });

    tableCustomerBD.rows.add(
      lastCustomerId,
      customerObject.nombre,
      customerObject.telefono_fijo,
      customerObject.telefono_movil,
      addressObject.numero_exterior,
      addressObject.numero_interior,      
      customerObject.correo_electronico,
      1,
      undefined,
      customerObject.observaciones ? customerObject.observaciones : undefined,
      customerObject.id_agente,
      customerObject.ocupacion ? customerObject.ocupacion : undefined,
      customerObject.curp,
      lastAddressId
    );

    tableAddressBD.rows.add(
      lastAddressId,
      addressObject.tipo_calle,
      addressObject.nombre_calle,
      addressObject.numero_exterior,
      addressObject.colonia,
      addressObject.municipio,
      addressObject.estado,
      addressObject.cp,
      addressObject.referencias,
      addressObject.created_by_usr,
      addressObject.created_date
    );

    let updateIndexIdQuery = ''

    console.log("Número interior: " + addressObject.numero_interior)

    if (addressObject.numero_interior) {
      tableAddressSuiteNumberBD.rows.add(
        lastAddressId,
        addressObject.numero_interior,
        lastCustomerId,
        "CLIENTE"
      );

      await procTransaction.request().bulk(tableAddressSuiteNumberBD);

      updateIndexIdQuery += `UPDATE [INDICES] SET [INDICE] = ${lastAddressId} + 1 WHERE OBJETO = 'ID_DOMICILIO' 
                        `
    }

    await procTransaction.request().bulk(tableCustomerBD);
    await procTransaction.request().bulk(tableAddressBD);


    updateIndexIdQuery += `UPDATE [INDICES] SET [INDICE] = ${lastCustomerId} + 1 WHERE OBJETO = 'ID_CLIENTE'`

    console.log("Query para actualizar indices: " + updateIndexIdQuery)

    const requestUpdate = procTransaction.request()
    const updateResult = await requestUpdate.query(updateIndexIdQuery)

    if(!updateResult.rowsAffected.length) {
      message = 'No se pudo actualizar'
      return { message, idCustomer: 0 }
    }

    message = "Alta de nuevo cliente terminó de manera exitosa";
    return { message, idCustomer: lastCustomerId };
  } catch (error) {
    let message = '';
    let errorMessage = '';

    if (error instanceof Error) {
      message = `Error durante la transacción`;
      errorMessage = error.message as string;
    }
    console.log({ message, error });
    return { message, idCustomer: 0, error: errorMessage };
  }
};
