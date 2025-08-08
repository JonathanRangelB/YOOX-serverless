import { Transaction } from 'mssql';
import { FormCustomer } from '../../../interfaces/customer-interface';
import { Direccion } from '../../../interfaces/common-properties';
import { StatusCodes } from '../../../helpers/statusCodes';
import { GenericBDRequest } from '../../types/genericBDRequest';
import { registerNewAddress } from '../address/registerNewAddress';
import { updateAddress } from '../address/updateAddress';

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
    };

    let resultadoOperacionActualizaDomicilio;
    let idDomicilio;

    if (id_domicilio_cliente) {
      resultadoOperacionActualizaDomicilio = await updateAddress(
        direccionCliente,
        id_cliente,
        'CLIENTE',
        procTransaction
      );
      idDomicilio = id_domicilio_cliente;
    } else {
      resultadoOperacionActualizaDomicilio = await registerNewAddress(
        direccionCliente,
        id_cliente,
        'CLIENTE',
        procTransaction
      );
      idDomicilio = resultadoOperacionActualizaDomicilio.generatedId;
    }

    if (!resultadoOperacionActualizaDomicilio.generatedId)
      return {
        message: 'Error al registrar/actualizar el domicilio del cliente',
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST,
      };

    const queryUpdateCustomer = `
                  UPDATE
                  CLIENTES

                  SET        
                  NOMBRE = '${nombre_cliente} ${apellido_paterno_cliente} ${apellido_materno_cliente}'
                  ,TELEFONO_FIJO = ${telefono_fijo_cliente ? `'${telefono_fijo_cliente}'` : `NULL`}
                  ,TELEFONO_MOVIL = ${telefono_movil_cliente ? `'${telefono_movil_cliente}'` : `NULL`}
                  ,CORREO_ELECTRONICO = ${correo_electronico_cliente ? `'${correo_electronico_cliente}'` : `NULL`}
                  ,ACTIVO = ${cliente_activo}
                  ,ID_AGENTE = ${id_agente}
                  ,OCUPACION = ${ocupacion_cliente ? `'${ocupacion_cliente}'` : `NULL`}
                  ,CURP = '${curp_cliente}'
                  ,ID_DOMICILIO = ${idDomicilio}

                  WHERE ID = ${id_cliente}
                  
                  `;
    const queryLimpiaAvalCliente = ` DELETE FROM CLIENTES_AVALES WHERE ID_CLIENTE = ${id_cliente} 

                  `;
    let queryActualizaAvalCliente = '';

    if (id_aval) {
      queryActualizaAvalCliente = ` INSERT INTO CLIENTES_AVALES (ID_CLIENTE, ID_AVAL) VALUES (${id_cliente}, ${id_aval}) 
                  `;
    }

    const customerUpdate = await procTransaction
      .request()
      .query(
        queryUpdateCustomer + queryLimpiaAvalCliente + queryActualizaAvalCliente
      );

    if (!customerUpdate.rowsAffected[0])
      return {
        message: 'Cliente no actualizado',
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST,
      };

    return {
      message: 'Cliente actualizado',
      generatedId: id_cliente,
      error: StatusCodes.OK,
    };
  } catch (error) {
    let errorMessage = '';

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
