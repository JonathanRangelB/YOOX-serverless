import { Int, Table, VarChar, Transaction, Bit } from "mssql";
import { IndexesId } from "../../../helpers/table-schemas";
import { CustomerReqResponse } from "../../types/customerRequest";
import { FormCustomer } from "../../../interfaces/customer-interface";
import { Direccion } from "../../../interfaces/common-properties";
import { registerNewAddress } from "../address/registerNewAddress";
import { updateAddress } from "../address/updateAddress";

export const registerNewCustomer = async (
  formCliente: FormCustomer,
  procTransaction: Transaction
): Promise<CustomerReqResponse> => {
  try {
    const {
      nombre_cliente,
      apellido_paterno_cliente,
      apellido_materno_cliente,
      telefono_fijo_cliente,
      telefono_movil_cliente,
      correo_electronico_cliente,
      ocupacion_cliente,
      curp_cliente,
      tipo_calle_cliente,
      nombre_calle_cliente,
      numero_exterior_cliente,
      numero_interior_cliente,
      colonia_cliente,
      municipio_cliente,
      estado_cliente,
      cp_cliente,
      referencias_dom_cliente,
      id_agente,
      cliente_creado_por,
      fecha_creacion_cliente,
      cliente_activo,
      id_domicilio_cliente,
      id_aval,
      gmaps_url_location,
      cruce_calles_cliente
    } = formCliente;

    const direccionCliente: Direccion = {
      id: id_domicilio_cliente,
      tipo_calle: tipo_calle_cliente,
      nombre_calle: nombre_calle_cliente,
      numero_exterior: numero_exterior_cliente,
      numero_interior: numero_interior_cliente,
      colonia: colonia_cliente,
      municipio: municipio_cliente,
      estado: estado_cliente,
      cp: cp_cliente,
      referencias_dom: referencias_dom_cliente,
      usuario: cliente_creado_por,
      fecha_operacion: fecha_creacion_cliente,
      gmaps_url_location: gmaps_url_location,
      cruce_calles: cruce_calles_cliente
    };

    const nextIdQuery = await procTransaction
      .request()
      .query<IndexesId>(
        `SELECT [objeto], [indice] FROM [INDICES] WHERE OBJETO IN ('ID_CLIENTE') ORDER BY OBJETO; `
      );

    const lastCustomerId = nextIdQuery.recordset[0].indice;
    const tableCustomerBD = new Table("CLIENTES");

    tableCustomerBD.create = false;

    tableCustomerBD.columns.add("ID", Int, { nullable: false });
    tableCustomerBD.columns.add("NOMBRE", VarChar, { nullable: false });
    tableCustomerBD.columns.add("TELEFONO_FIJO", VarChar, { nullable: true });
    tableCustomerBD.columns.add("TELEFONO_MOVIL", VarChar, { nullable: true });
    tableCustomerBD.columns.add("CORREO_ELECTRONICO", VarChar, {
      nullable: true,
    });
    tableCustomerBD.columns.add("ACTIVO", Bit, { nullable: true });
    tableCustomerBD.columns.add("ID_AGENTE", Int, { nullable: true });
    tableCustomerBD.columns.add("OCUPACION", VarChar, { nullable: true });
    tableCustomerBD.columns.add("CURP", VarChar, { nullable: false });

    tableCustomerBD.rows.add(
      lastCustomerId,
      nombre_cliente +
      " " +
      apellido_paterno_cliente +
      " " +
      apellido_materno_cliente,
      telefono_fijo_cliente,
      telefono_movil_cliente,
      correo_electronico_cliente,
      cliente_activo,
      id_agente,
      ocupacion_cliente || undefined,
      curp_cliente
    );

    let updateIndexIdQuery = "";

    const insertBulkData = await procTransaction
      .request()
      .bulk(tableCustomerBD);

    updateIndexIdQuery += `UPDATE [INDICES] SET [INDICE] = ${lastCustomerId} + 1 WHERE OBJETO = 'ID_CLIENTE'
                           
                          `;

    let addAddressResult;

    if (id_domicilio_cliente) {
      addAddressResult = await updateAddress(
        direccionCliente,
        lastCustomerId,
        "CLIENTE",
        procTransaction
      );
    } else {
      addAddressResult = await registerNewAddress(
        direccionCliente,
        lastCustomerId,
        "CLIENTE",
        procTransaction
      );
    }

    const lastAddressId = addAddressResult.generatedId;

    if (!lastAddressId) {
      return { message: "Error al registrar domicilio", idCustomer: 0 };
    }

    const updateAddressIdCustomer = `
                            UPDATE CLIENTES SET ID_DOMICILIO = ${lastAddressId} WHERE ID = ${lastCustomerId} `;

    let queryUpdateCustomerEndorsement = "";

    if (id_aval) {
      queryUpdateCustomerEndorsement = ` INSERT INTO CLIENTES_AVALES (ID_CLIENTE, ID_AVAL) VALUES (${lastCustomerId}, ${id_aval}) `;
    }

    const requestUpdate = procTransaction.request();
    const updateResult = await requestUpdate.query(
      updateIndexIdQuery +
      queryUpdateCustomerEndorsement +
      updateAddressIdCustomer
    );

    if (!insertBulkData.rowsAffected || !updateResult.rowsAffected.length) {
      return { message: "No se pudo registrar el cliente", idCustomer: 0 };
    }
    return {
      message: "Alta de nuevo cliente terminó de manera exitosa",
      idCustomer: lastCustomerId,
    };
  } catch (error) {
    let errorMessage = "";

    if (error instanceof Error) {
      errorMessage = error.message as string;
    }

    return {
      message: "Error durante la transacción",
      idCustomer: 0,
      error: errorMessage,
    };
  }
};
