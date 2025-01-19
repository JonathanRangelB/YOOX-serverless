import { Int, Table, VarChar, Transaction } from 'mssql';
import { indexes_id } from '../../../helpers/table-schemas';
import { endorsementReqResponse } from '../../types/endorsmentRequest';
import { formEndorsement } from '../../../interfaces/endorsement-interface';
import { Direccion } from '../../../interfaces/common-properties';
import { registerNewAddress } from '../address/registerNewAddress';

export const registerNewEndorsement = async (
  formAval: formEndorsement,
  procTransaction: Transaction
): Promise<endorsementReqResponse> => {
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
    } = formAval;

    const direccionAval: Direccion = {
      id: 0,
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
      .query<indexes_id>(
        `SELECT [objeto], [indice] FROM [INDICES] WHERE OBJETO IN ('ID_AVAL') ORDER BY OBJETO;`
      );

    lastEndorsmentId = nextIdQuery.recordset[0].indice;

    const addAddressResult = await registerNewAddress(
      direccionAval,
      lastEndorsmentId,
      'AVAL',
      procTransaction
    );

    if (!addAddressResult.generatedId) {
      return { message: 'Error al registrar domicilio', idEndorsment: 0 };
    }

    const lastAddressId = addAddressResult.generatedId;

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
    tableEndorsmentBD.columns.add('ID_DOMICILIO', Int, { nullable: true });

    tableEndorsmentBD.rows.add(
      lastEndorsmentId,
      nombre_aval + ' ' + apellido_paterno_aval + ' ' + apellido_materno_aval,
      telefono_fijo_aval,
      telefono_movil_aval,
      correo_electronico_aval,
      observaciones_aval,
      curp_aval,
      lastAddressId
    );

    let updateIndexIdQuery = '';

    const insertBulkData = await procTransaction
      .request()
      .bulk(tableEndorsmentBD);

    updateIndexIdQuery += `UPDATE [INDICES] SET [INDICE] = ${lastEndorsmentId} + 1 WHERE OBJETO = 'ID_AVAL'`;

    const requestUpdate = procTransaction.request();
    const updateResult = await requestUpdate.query(updateIndexIdQuery);

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
