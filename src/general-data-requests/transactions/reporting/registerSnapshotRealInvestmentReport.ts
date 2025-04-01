import { Transaction } from 'mssql';
import { genericBDRequest } from '../../types/genericBDRequest';
import { StatusCodes } from '../../../helpers/statusCodes';

export const registerSnapshotRealInvestmentReport = async (
  id_customer: number,
  id_loan: number,
  procTransaction: Transaction
): Promise<genericBDRequest> => {
  try {
    const queryStatement = `
                INSERT INTO REPORTE_INVERSION_REAL_SNAPSHOT
                (
                    FECHA_RENOVACION	
                    ,ID_CLIENTE	
                    ,NOMBRE_CLIENTE	
                    ,ID_PRESTAMO_ANTERIOR	
                    ,ID_PRESTAMO_NUEVO	
                    ,CUENTA_NUEVA_FLAG	
                    ,CANTIDAD_REFINANCIADA	
                    ,INVERSION_TOTAL	
                    ,INVERSION_REAL	
                    ,ID_AGENTE	
                    ,NOMBRE_AGENTE	
                    ,ID_GRUPO	
                    ,NOMBRE_GRUPO
                )

                SELECT
                FECHA_DE_RENOVACION
                ,CODIGO_CLIENTE
                ,NOMBRE_CLIENTE
                ,FOLIO_PRESTAMO_ANTERIOR
                ,FOLIO_PRESTAMO_NUEVO
                ,CASE COUNT_PRESTAMO
                    WHEN 1 THEN 'Y'
                    ELSE 'N'
                END AS [NUEVO_CREDITO]
                ,CANTIDAD_REFINANCIADA
                ,INVERSION_TOTAL
                ,INVERSION_TOTAL - CANTIDAD_REFINANCIADA AS [INVERSION_REAL]
                ,ID_COBRADOR
                ,AGENTE
                ,ID_GRUPO
                ,GRUPO

                FROM
                (
                    SELECT
                    T1.FECHA AS FECHA_DE_RENOVACION
                    ,T1.ID_CLIENTE AS CODIGO_CLIENTE
                    ,T2.NOMBRE AS NOMBRE_CLIENTE
                    ,T1.ID_PRESTAMO_ANT AS FOLIO_PRESTAMO_ANTERIOR
                    ,T1.ID_PRESTAMO_ACT AS FOLIO_PRESTAMO_NUEVO
                    ,T1.CANTIDAD AS CANTIDAD_REFINANCIADA
                    ,T3.CANTIDAD_PRESTADA AS INVERSION_TOTAL
                    ,T4.NOMBRE AS AGENTE
                    ,T6.NOMBRE AS GRUPO
                    ,T3.ID_COBRADOR
                    ,T3.ID_GRUPO_ORIGINAL AS ID_GRUPO
                    ,T3.STATUS
                    ,T7.COUNT_PRESTAMO

                    FROM REFINANCIA T1
                    LEFT JOIN CLIENTES T2 ON T1.ID_CLIENTE = T2.ID 
                    LEFT JOIN PRESTAMOS T3 ON T1.ID_PRESTAMO_ACT = T3.ID 
                    LEFT JOIN USUARIOS T4 ON T3.ID_COBRADOR = T4.ID
                    LEFT JOIN GRUPOS_AGENTES T6 ON T6.ID_GRUPO = T3.ID_GRUPO_ORIGINAL
                    LEFT JOIN (SELECT COUNT(ID) AS [COUNT_PRESTAMO], ID_CLIENTE FROM PRESTAMOS
                        WHERE STATUS <> 'CANCELADO'
                        GROUP BY ID_CLIENTE) AS T7 ON T1.ID_CLIENTE=T7.ID_CLIENTE

                    UNION


                    SELECT
                    T1.FECHA_INICIAL AS FECHA_DE_RENOVACION
                    ,T1.ID_CLIENTE AS CODIGO_CLIENTE
                    ,T2.NOMBRE AS NOMBRE_CLIENTE
                    ,NULL AS FOLIO_PRESTAMO_ANTERIOR
                    ,T1.ID AS FOLIO_PRESTAMO_NUEVO
                    ,0.0 AS CANTIDAD_REFINANCIADA
                    ,T1.CANTIDAD_PRESTADA AS INVERSION_TOTAL
                    ,T4.NOMBRE AS AGENTE
                    ,T6.NOMBRE AS GRUPO
                    ,T1.ID_COBRADOR
                    ,T1.ID_GRUPO_ORIGINAL AS ID_GRUPO
                    ,T1.STATUS
                    ,T7.COUNT_PRESTAMO

                    FROM 
                    PRESTAMOS AS T1
                    LEFT JOIN CLIENTES AS T2 ON T1.ID_CLIENTE = T2.ID 
                    LEFT JOIN USUARIOS AS T4 ON T1.ID_COBRADOR = T4.ID 
                    LEFT JOIN GRUPOS_AGENTES AS T6 ON T1.ID_GRUPO_ORIGINAL = T6.ID_GRUPO
                    LEFT JOIN (SELECT COUNT(ID) AS [COUNT_PRESTAMO], ID_CLIENTE FROM PRESTAMOS
                        WHERE STATUS <> 'CANCELADO'
                        GROUP BY ID_CLIENTE) AS T7 ON T1.ID_CLIENTE=T7.ID_CLIENTE

                    WHERE                                         
                    T1.ID NOT IN (SELECT DISTINCT ID_PRESTAMO_ACT FROM REFINANCIA)

                ) AS TAB WHERE TAB.CODIGO_CLIENTE = ${id_customer} 
                 AND TAB.FOLIO_PRESTAMO_NUEVO = ${id_loan}
    `;

    const executeInsertResult = await procTransaction
      .request()
      .query(queryStatement);

    if (!executeInsertResult.rowsAffected[0]) {
      return {
        message: 'Error durante la transacción',
        generatedId: 0,
        error: StatusCodes.BAD_REQUEST,
      };
    }

    return {
      message: 'Snapshot de inversion real registrado correctamente',
      generatedId: 1,
      error: StatusCodes.OK,
    };
  } catch (exception) {
    return {
      message: (exception as Error).message,
      generatedId: 0,
      error: StatusCodes.BAD_REQUEST,
    };
  }
};
