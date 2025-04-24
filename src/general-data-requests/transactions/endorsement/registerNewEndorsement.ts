import { Int, Table, VarChar, Transaction } from 'mssql';
import { IndexesId } from '../../../helpers/table-schemas';
import { EndorsementReqResponse } from '../../types/endorsmentRequest';
import { FormEndorsement } from '../../../interfaces/endorsement-interface';
import { Direccion } from '../../../interfaces/common-properties';
import { registerNewAddress } from '../address/registerNewAddress';
import { updateAddress } from '../address/updateAddress';

export const registerNewEndorsement = async (
  formAval: FormEndorsement,
  procTransaction: Transaction
): Promise<EndorsementReqResponse> => {
  try {
    const {
      nombre_aval,
      apellido_paterno_aval,
      apellido_materno_aval,
      telefono_fijo_aval,
      telefono_movil_aval,
      correo_electronico_aval,
      observaciones_aval,
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
      aval_creado_por,
      fecha_creacion_aval,
      id_domicilio_aval,
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
      usuario: aval_creado_por,
      fecha_operacion: fecha_creacion_aval,
    };

    let lastEndorsmentId = 0;

    const nextIdQuery = await procTransaction
      .request()
      .query<IndexesId>(
        `SELECT [objeto], [indice] FROM [INDICES] WHERE OBJETO IN ('ID_AVAL') ORDER BY OBJETO;`
      );

    lastEndorsmentId = nextIdQuery.recordset[0].indice;

    const tableEndorsmentBD = new Table('AVALES');

    tableEndorsmentBD.create = false;

    tableEndorsmentBD.columns.add('ID_AVAL', Int, { nullable: false });
    tableEndorsmentBD.columns.add('NOMBRE', VarChar, { nullable: false });
    tableEndorsmentBD.columns.add('TELEFONO_FIJO', VarChar, { nullable: true });
    tableEndorsmentBD.columns.add('TELEFONO_MOVIL', VarChar, {
      nullable: true,
    });
    tableEndorsmentBD.columns.add('CORREO_ELECTRONICO', VarChar, {
      nullable: true,
    });
    tableEndorsmentBD.columns.add('OBSERVACIONES', VarChar, { nullable: true });
    tableEndorsmentBD.columns.add('CURP', VarChar, { nullable: false });

    tableEndorsmentBD.rows.add(
      lastEndorsmentId,
      nombre_aval + ' ' + apellido_paterno_aval + ' ' + apellido_materno_aval,
      telefono_fijo_aval,
      telefono_movil_aval,
      correo_electronico_aval,
      observaciones_aval,
      curp_aval
    );

    const insertBulkData = await procTransaction
      .request()
      .bulk(tableEndorsmentBD);

    const updateIndexIdQuery = `UPDATE [INDICES] SET [INDICE] = ${lastEndorsmentId} + 1 WHERE OBJETO = 'ID_AVAL'`;

    let addAddressResult;

    if (id_domicilio_aval) {
      addAddressResult = await updateAddress(
        direccionAval,
        lastEndorsmentId,
        'AVAL',
        procTransaction
      );
    } else {
      addAddressResult = await registerNewAddress(
        direccionAval,
        lastEndorsmentId,
        'AVAL',
        procTransaction
      );
    }

    const lastAddressId = addAddressResult.generatedId;

    if (!lastAddressId) {
      return { message: 'Error al registrar domicilio', idEndorsment: 0 };
    }

    const updateAddressIdEndorsement = `
                                    UPDATE AVALES SET ID_DOMICILIO = ${lastAddressId} WHERE ID_AVAL = ${lastEndorsmentId}`;

    const requestUpdate = procTransaction.request();
    const updateResult = await requestUpdate.query(
      updateIndexIdQuery + updateAddressIdEndorsement
    );

    if (!insertBulkData.rowsAffected || !updateResult.rowsAffected.length) {
      return { message: 'No se pudo registrar el aval', idEndorsment: 0 };
    }

    return {
      message: 'Alta de nuevo aval terminó de manera exitosa',
      idEndorsment: lastEndorsmentId,
    };
  } catch (error) {
    let errorMessage = '';

    if (error instanceof Error) {
      errorMessage = error.message as string;
    }

    return {
      message: 'Error durante la transacción',
      idEndorsment: 0,
      error: errorMessage,
    };
  }
};
