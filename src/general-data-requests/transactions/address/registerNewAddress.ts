import { Int, Table, VarChar, Transaction, Bit, DateTime } from 'mssql';
import { indexes_id } from '../../../helpers/table-schemas';
import { genericBDRequest } from '../../types/genericBDRequest';
import { StatusCodes } from '../../../helpers/statusCodes';
import { Direccion } from '../../../interfaces/common-properties';

export const registerNewAddress = async (
    direccion: Direccion,
    id_persona: number,
    tipo: string,
    procTransaction: Transaction
): Promise<genericBDRequest> => {

    const {
        tipo_calle,
        nombre_calle,
        numero_exterior,
        numero_interior,
        colonia,
        municipio,
        estado,
        cp,
        referencias_dom,
        usuario,
        fecha_operacion,
    } = direccion;

    const {
        value: tipoCalle
    } = tipo_calle;

    const {
        value: estadoNombre
    } = estado;

    try {
        const nextIdQuery = await procTransaction
            .request()
            .query<indexes_id>(
                `SELECT [objeto], [indice] FROM [INDICES] WHERE OBJETO IN ('ID_DOMICILIO') ORDER BY OBJETO; `
            );

        const lastAddressId = nextIdQuery.recordset[0].indice;

        const tableAddressBD = new Table('DOMICILIOS');

        tableAddressBD.create = false;

        tableAddressBD.columns.add('ID', Int, { nullable: false });
        tableAddressBD.columns.add('TIPO_CALLE', VarChar(50), { nullable: true });
        tableAddressBD.columns.add('NOMBRE_CALLE', VarChar(100), { nullable: true });
        tableAddressBD.columns.add('NUMERO_EXTERIOR', VarChar(10), { nullable: true });
        tableAddressBD.columns.add('COLONIA', VarChar(100), { nullable: true });
        tableAddressBD.columns.add('MUNICIPIO', VarChar(100), { nullable: true });
        tableAddressBD.columns.add('ESTADO', VarChar(50), { nullable: true });
        tableAddressBD.columns.add('CP', VarChar(10), { nullable: true });
        tableAddressBD.columns.add('REFERENCIAS', VarChar(100), { nullable: true });
        tableAddressBD.columns.add('CREATED_BY_USR', Int, { nullable: true });
        tableAddressBD.columns.add('CREATED_DATE', DateTime, { nullable: true });

        tableAddressBD.rows.add(
            lastAddressId,
            tipoCalle,
            nombre_calle,
            numero_exterior,
            colonia,
            municipio,
            estadoNombre,
            cp,
            referencias_dom,
            usuario,
            fecha_operacion,
        );

        const insertResult = await procTransaction.request().bulk(tableAddressBD);

        if (numero_interior) {

            const tableAddressSuiteNumberBD = new Table('DOMICILIOS_NUM_INTERIOR');
            tableAddressSuiteNumberBD.create = false;

            tableAddressSuiteNumberBD.columns.add('ID_DOMICILIO', Int, {
                nullable: false,
            });
            tableAddressSuiteNumberBD.columns.add('NUMERO_INTERIOR', VarChar, {
                nullable: false,
            });
            tableAddressSuiteNumberBD.columns.add('ID_CLIENTE', Int, {
                nullable: true,
            });
            tableAddressSuiteNumberBD.columns.add('ID_AVAL', Int, {
                nullable: true,
            });
            tableAddressSuiteNumberBD.columns.add('TIPO', VarChar, { nullable: true });

            tableAddressSuiteNumberBD.rows.add(
                lastAddressId,
                numero_interior,
                tipo === 'CLIENTE' ? id_persona : null,
                tipo === 'AVAL' ? id_persona : null,
                tipo
            );

            const updateSuiteNumber = await procTransaction.request().bulk(tableAddressSuiteNumberBD)

            if (!updateSuiteNumber.rowsAffected)
                return {
                    message: 'No se pudo registrar el número interior',
                    generatedId: 0,
                    error: StatusCodes.BAD_REQUEST,
                }
        }

        const updateIndexIdQuery = `UPDATE [INDICES] SET [INDICE] = ${lastAddressId} + 1 WHERE OBJETO = 'ID_DOMICILIO' `;

        const requestUpdate = procTransaction.request();
        const updateIndexIdResult = await requestUpdate.query(updateIndexIdQuery);

        if (!insertResult.rowsAffected || !updateIndexIdResult.rowsAffected[0])
            return {
                message: 'No se pudo registrar el domicilio',
                generatedId: 0,
                error: StatusCodes.BAD_REQUEST,
            }

        return {
            message: 'Domicilio registrado correctamente',
            generatedId: lastAddressId,
            error: StatusCodes.OK,
        };

    } catch (error) {
        return {
            message: 'Error durante la transacción',
            generatedId: 0,
            error: StatusCodes.BAD_REQUEST,
        }
    }
}