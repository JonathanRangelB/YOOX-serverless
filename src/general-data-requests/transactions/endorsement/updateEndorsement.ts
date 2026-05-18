import sql, { Transaction } from "mssql";
import { FormEndorsement } from "../../../interfaces/endorsement-interface";
import { Direccion } from "../../../interfaces/common-properties";
import { StatusCodes } from "../../../helpers/statusCodes";
import { GenericBDRequest } from "../../types/genericBDRequest";
import { registerNewAddress } from "../address/registerNewAddress";
import { updateAddress } from "../address/updateAddress";

export const updateEndorsement = async (
  formAval: FormEndorsement,
  procTransaction: Transaction
): Promise<GenericBDRequest> => {
  try {
    const {
      id_aval,
      nombre_aval,
      apellido_paterno_aval,
      apellido_materno_aval,
      telefono_fijo_aval,
      telefono_movil_aval,
      correo_electronico_aval,
      curp_aval,
      tipo_calle_aval,
      nombre_calle_aval,
      numero_exterior_aval,
      numero_interior_aval,
      colonia_aval,
      municipio_aval,
      estado_aval,
      cp_aval,
      referencias_dom_aval,
      aval_modificado_por,
      fecha_modificacion_aval,
      id_domicilio_aval,
      ocupacion_aval,
      cruce_calles_aval,
      isGuarantorAddressUpdate,
    } = formAval;

    const direccionAval: Direccion = {
      id: id_domicilio_aval,
      tipo_calle: tipo_calle_aval,
      nombre_calle: nombre_calle_aval,
      numero_exterior: numero_exterior_aval,
      numero_interior: numero_interior_aval,
      colonia: colonia_aval,
      municipio: municipio_aval,
      estado: estado_aval,
      cp: cp_aval,
      referencias_dom: referencias_dom_aval,
      usuario: aval_modificado_por,
      fecha_operacion: fecha_modificacion_aval,
      gmaps_url_location: "",
      cruce_calles: cruce_calles_aval,
    };

    let resultadoOperacion;
    let idDomicilio;

    if (isGuarantorAddressUpdate && id_domicilio_aval) {
      resultadoOperacion = await updateAddress(
        direccionAval,
        id_aval,
        "AVAL",
        procTransaction
      );
      idDomicilio = id_domicilio_aval;
    } else {
      resultadoOperacion = await registerNewAddress(
        direccionAval,
        id_aval,
        "AVAL",
        procTransaction
      );
      idDomicilio = resultadoOperacion.generatedId;
    }

    if (!resultadoOperacion.generatedId)
      return {
        message: "Error al registrar/actualizar el domicilio del aval",
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST,
      };


    const poolRequest = procTransaction.request();

    const queryUpdateEndorsement = `
                    UPDATE
                    AVALES

                    SET
                    NOMBRE = @nombre_aval,
                    TELEFONO_FIJO = @telefono_fijo_aval,
                    TELEFONO_MOVIL = @telefono_movil_aval,
                    CORREO_ELECTRONICO = @correo_electronico_aval,
                    CURP = @curp_aval,
                    ID_DOMICILIO = @idDomicilio,
                    OCUPACION_AVAL = @ocupacion_aval

                    WHERE ID_AVAL = @id_aval

                    `;

    poolRequest.input("nombre_aval", sql.VarChar, `${nombre_aval} ${apellido_paterno_aval} ${apellido_materno_aval}`);
    poolRequest.input("telefono_fijo_aval", sql.VarChar, telefono_fijo_aval || null);
    poolRequest.input("telefono_movil_aval", sql.VarChar, telefono_movil_aval || null);
    poolRequest.input("correo_electronico_aval", sql.VarChar, correo_electronico_aval || null);
    poolRequest.input("curp_aval", sql.VarChar, curp_aval);
    poolRequest.input("idDomicilio", sql.Int, idDomicilio);
    poolRequest.input("ocupacion_aval", sql.VarChar, ocupacion_aval || null);
    poolRequest.input("id_aval", sql.Int, id_aval);

    const updateEndorsementResult = await poolRequest.query(queryUpdateEndorsement);

    if (!updateEndorsementResult.rowsAffected[0])
      return {
        message: "Aval no actualizado",
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST,
      };

    return {
      message: "Aval actualizado",
      generatedId: id_aval,
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
