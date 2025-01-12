import { Transaction } from 'mssql';
import { genericBDRequest } from '../../types/genericBDRequest';
import { Direccion } from '../../../interfaces/common-properties';
import { StatusCodes } from '../../../helpers/statusCodes';

export const updateAddress = async (
    direccion: Direccion,
    id_persona: number,
    tipo: string,
    procTransaction: Transaction
): Promise<genericBDRequest> => {

    const {
        id,
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

        const domicilioEncontrado = await procTransaction.request().query(`SELECT 1 FROM DOMICILIOS WHERE ID = ${id}`)

        if (!domicilioEncontrado.rowsAffected[0])
            return {
                message: 'Domicilio no encontrado',
                generatedId: 0,
                error: StatusCodes.NOT_FOUND,
            }


        let queryUpdateAddress = `
        UPDATE
        DOMICILIOS

        SET
        TIPO_CALLE = '${tipoCalle}'
        ,NOMBRE_CALLE = '${nombre_calle}'
        ,NUMERO_EXTERIOR = '${numero_exterior}'
        ,COLONIA = '${colonia}'
        ,MUNICIPIO = '${municipio}'
        ,ESTADO = '${estadoNombre}'
        ,CP = '${cp}'
        ,REFERENCIAS = '${referencias_dom}'
        ,MODIFIED_BY_USR = ${usuario}
        ,MODIFIED_DATE = '${fecha_operacion as Date}'

        WHERE
        ID = ${id}  
        
        `

        let tipoId = ''
        let valoresAInsertar = ''

        switch (tipo) {
            case 'CLIENTE':
                valoresAInsertar = `(${id}, '${numero_interior}', ${id_persona}, NULL, 'CLIENTE')`
                tipoId = 'ID_CLIENTE'
                break;
            case 'AVAL':
                valoresAInsertar = `(${id}, '${numero_interior}', NULL, ${id_persona}, 'AVAL')`
                tipoId = 'ID_AVAL'
                break;
        }

        let queryClearSuiteNumber = `
                DELETE 
                FROM DOMICILIOS_NUM_INTERIOR 
                WHERE TIPO = '${tipo}' AND ${tipoId} = ${id_persona}  
                
                `
        let queryUpdateSuiteNumber = `
                INSERT INTO
                DOMICILIOS_NUM_INTERIOR
                (ID_DOMICILIO, NUMERO_INTERIOR, ID_CLIENTE, ID_AVAL, TIPO)
                VALUES
                ${valoresAInsertar}
                                
        `

        console.log(queryUpdateAddress + queryClearSuiteNumber + queryUpdateSuiteNumber)

        const updateResult = await procTransaction.request().query(queryUpdateAddress + queryClearSuiteNumber + queryUpdateSuiteNumber)

        if (!updateResult.rowsAffected[0])
            return {
                message: 'Domicilio no actualizado',
                generatedId: 0,
                error: StatusCodes.BAD_REQUEST,
            }

        return {
            message: 'Domicilio actualizado',
            generatedId: id
        }

    } catch (error) {
        return {
            message: 'Error durante la transacción',
            generatedId: 0,
            error: StatusCodes.BAD_REQUEST,
        }
    }
}