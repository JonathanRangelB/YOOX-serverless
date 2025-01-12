import { Transaction } from 'mssql';
import { formCustomer } from '../../../interfaces/customer-interface';
import { Direccion } from '../../../interfaces/common-properties';
import { StatusCodes } from '../../../helpers/statusCodes';
import { genericBDRequest } from '../../types/genericBDRequest';
import { registerNewAddress } from '../address/registerNewAddress';
import { updateAddress } from '../address/updateAddress';

export const updateCustomer = async (
  formCliente: formCustomer,
  procTransaction: Transaction
): Promise<genericBDRequest> => {

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
      id_domicilio_cliente

    } = formCliente

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
      fecha_operacion: fecha_modificacion_cliente
    }

    let resultadoOperacion
    let idDomicilio

    if (id_domicilio_cliente) {
      resultadoOperacion = await updateAddress(direccionCliente, id_cliente, 'CLIENTE', procTransaction)
      idDomicilio = id_domicilio_cliente
    } else {
      resultadoOperacion = await registerNewAddress(direccionCliente, id_cliente, 'CLIENTE', procTransaction)
      idDomicilio = resultadoOperacion.generatedId
    }

    if (!resultadoOperacion.generatedId)
      return {
        message: 'Error al registrar/actualizar el domicilio',
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST
      }

    let queryUpdateCustomer = `
                  UPDATE
                  CLIENTES

                  SET        
                  NOMBRE = '${nombre_cliente} ${apellido_paterno_cliente} ${apellido_materno_cliente}'
                  ,TELEFONO_FIJO = '${telefono_fijo_cliente}'
                  ,TELEFONO_MOVIL = '${telefono_movil_cliente}'
                  ,CORREO_ELECTRONICO = '${correo_electronico_cliente}'
                  ,ACTIVO = ${cliente_activo}
                  ,ID_AGENTE = ${id_agente}
                  ,OCUPACION = '${ocupacion_cliente}'
                  ,CURP = '${curp_cliente}'
                  ,ID_DOMICILIO = ${idDomicilio}

                  WHERE ID = ${id_cliente} 
                  
                  `

    const customerUpdate = await procTransaction.request().query(queryUpdateCustomer)

    if (!customerUpdate.rowsAffected[0])
      return {
        message: 'Cliente no actualizado',
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST
      }

    return {
      message: 'Cliente actualizado',
      generatedId: id_cliente,
      error: StatusCodes.OK
    }

  } catch (error) {
    let errorMessage = '';

    if (error instanceof Error) {
      errorMessage = error.message as string;
    }

    return {
      message: errorMessage,
      generatedId: 0,
      error: StatusCodes.BAD_REQUEST
    }
  }

}