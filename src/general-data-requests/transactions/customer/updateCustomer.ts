import sql, { Transaction } from "mssql";
import { FormCustomer } from "../../../interfaces/customer-interface";
import { Direccion } from "../../../interfaces/common-properties";
import { StatusCodes } from "../../../helpers/statusCodes";
import { GenericBDRequest } from "../../types/genericBDRequest";
import { registerNewAddress } from "../address/registerNewAddress";
import { updateAddress } from "../address/updateAddress";

export const updateCustomer = async (
  formCliente: FormCustomer,
  procTransaction: Transaction
): Promise<GenericBDRequest> => {
  try {
    const {
      id_cliente,
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
      cliente_modificado_por,
      fecha_modificacion_cliente,
      cliente_activo,
      id_domicilio_cliente,
      id_aval,
      gmaps_url_location,
      cruce_calles_cliente,
      isCustomerAddressUpdate,
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
      usuario: cliente_modificado_por,
      fecha_operacion: fecha_modificacion_cliente,
      gmaps_url_location: gmaps_url_location,
      cruce_calles: cruce_calles_cliente,
    };

    let resultadoOperacionActualizaDomicilio;
    let idDomicilio;

    if (isCustomerAddressUpdate && id_domicilio_cliente) {
      resultadoOperacionActualizaDomicilio = await updateAddress(
        direccionCliente,
        id_cliente,
        "CLIENTE",
        procTransaction
      );
      idDomicilio = id_domicilio_cliente;
    } else {
      resultadoOperacionActualizaDomicilio = await registerNewAddress(
        direccionCliente,
        id_cliente,
        "CLIENTE",
        procTransaction
      );
      idDomicilio = resultadoOperacionActualizaDomicilio.generatedId;
    }

    if (!resultadoOperacionActualizaDomicilio.generatedId)
      return {
        message: "Error al registrar/actualizar el domicilio del cliente",
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST,
      };

    const poolRequest = procTransaction.request();

    const queryUpdateCustomer = `
                  UPDATE
                  CLIENTES

                  SET        
                  NOMBRE = @nombre_cliente
                  ,TELEFONO_FIJO = @telefono_fijo_cliente
                  ,TELEFONO_MOVIL = @telefono_movil_cliente
                  ,CORREO_ELECTRONICO = @correo_electronico_cliente
                  ,ACTIVO = @cliente_activo
                  ,ID_AGENTE = @id_agente
                  ,OCUPACION = @ocupacion_cliente
                  ,CURP = @curp_cliente
                  ,ID_DOMICILIO = @idDomicilio

                  WHERE ID = @id_cliente
                  
                  `;

    poolRequest.input("nombre_cliente", sql.VarChar, `${nombre_cliente} ${apellido_paterno_cliente} ${apellido_materno_cliente}`);
    poolRequest.input("telefono_fijo_cliente", sql.VarChar, telefono_fijo_cliente || null);
    poolRequest.input("telefono_movil_cliente", sql.VarChar, telefono_movil_cliente || null);
    poolRequest.input("correo_electronico_cliente", sql.VarChar, correo_electronico_cliente || null);
    poolRequest.input("cliente_activo", sql.Bit, cliente_activo);
    poolRequest.input("id_agente", sql.Int, id_agente);
    poolRequest.input("ocupacion_cliente", sql.VarChar, ocupacion_cliente || null);
    poolRequest.input("curp_cliente", sql.VarChar, curp_cliente);
    poolRequest.input("idDomicilio", sql.Int, idDomicilio);
    poolRequest.input("id_cliente", sql.Int, id_cliente);

    const queryLimpiaAvalCliente = 'DELETE FROM CLIENTES_AVALES WHERE ID_CLIENTE = @clientes_avales_id_cliente_delete ';
    poolRequest.input("clientes_avales_id_cliente_delete", sql.Int, id_cliente);

    let queryActualizaAvalCliente = "";

    if (id_aval) {
      queryActualizaAvalCliente = 'INSERT INTO CLIENTES_AVALES (ID_CLIENTE, ID_AVAL) VALUES (@clientes_avales_id_cliente_insert, @clientes_avales_id_aval_insert) ';
      poolRequest.input("clientes_avales_id_cliente_insert", sql.Int, id_cliente);
      poolRequest.input("clientes_avales_id_aval_insert", sql.Int, id_aval);
    }

    const customerUpdate = await poolRequest.query(queryUpdateCustomer + queryLimpiaAvalCliente + queryActualizaAvalCliente);

    if (!customerUpdate.rowsAffected[0])
      return {
        message: "Cliente no actualizado",
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST,
      };

    return {
      message: "Cliente actualizado",
      generatedId: id_cliente,
      error: StatusCodes.OK,
    };
  } catch (error) {
    let errorMessage = "";

    if (error instanceof Error) {
      errorMessage = error.message as string;
    }

    return {
      message: errorMessage,
      generatedId: 0,
      error: StatusCodes.BAD_REQUEST,
    };
  }
};
