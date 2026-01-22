import { RolesDeUsuario } from "../../../helpers/utils";
import { accessByUserRolTable } from "../../../secure-data-access/getAccessByUserRol";

export function outstandingCollectionsQuery(
  id_usuario: number,
  rol_usuario: string,
  userIdFilter: number,
  groupIdFilter: number,
  managementIdFilter: number
): string {
  let whereFilterSecureData = ``;
  let whereFilterSelectedData = ``;
  let secureDataTable = ``;

  switch (rol_usuario) {
    case RolesDeUsuario.LIDER_DE_GRUPO: {
      secureDataTable = accessByUserRolTable(id_usuario, rol_usuario);
      whereFilterSecureData = ` AND T0.ID_COBRADOR IN (SELECT ID FROM LIDER_GRUPO_TABLA) `;
      break;
    }

    case RolesDeUsuario.COBRADOR: {
      whereFilterSecureData = ` AND T0.ID_COBRADOR = ${id_usuario} `;
      break;
    }
  }

  if (userIdFilter) {
    whereFilterSelectedData = ` WHERE PB.ID_COBRADOR = ${userIdFilter} `;
  } else if (groupIdFilter) {
    whereFilterSelectedData = ` WHERE PB.ID_GRUPO = ${groupIdFilter} `;
  } else if (managementIdFilter) {
    whereFilterSelectedData = ` WHERE PB.ID_GERENCIA = ${managementIdFilter} `;
  }

  const cteQuery = `
    WITH

    ${secureDataTable}
    
    CTE_PrestamosBase AS (
                                    SELECT 
                                        T0.ID,
                                        T0.ID_CLIENTE,
                                        T0.ID_COBRADOR,
                                        T0.FECHA_FINAL_ESTIMADA,
                                        T5.NOMBRE AS [NOMBRE_GERENCIA],
                                        T0.DIA_SEMANA,
                                        T6.SEMANAS_PLAZO,
                                        T4.NOMBRE AS [NOMBRE_GRUPO],
                                        T0.CANTIDAD_PRESTADA,
                                        T0.CANTIDAD_RESTANTE,
                                        T3.ID_GRUPO,
                                        T4.ID_GERENCIA

                                    FROM [dbo].[PRESTAMOS] T0
                                    LEFT JOIN [dbo].USUARIOS T3 ON T0.ID_COBRADOR = T3.ID
                                    LEFT JOIN [dbo].GRUPOS_AGENTES T4 ON T4.ID_GRUPO = T3.ID_GRUPO
                                    LEFT JOIN [dbo].GERENCIAS_GRUPOS T5 ON T5.ID_GERENCIA = T4.ID_GERENCIA
                                    LEFT JOIN [dbo].PLAZO T6 ON T0.ID_PLAZO=T6.ID

                                    WHERE T0.[STATUS] = 'EMITIDO'
                                    ${whereFilterSecureData}

                                ),
                                CTE_DetallesPrestamos AS (
                                    -- Consolidamos todos los cálculos de PRESTAMOS_DETALLE en un solo CTE
                                    SELECT 
                                        PD.ID_PRESTAMO,
                                        MAX(CASE WHEN RN = 1 THEN PD.CANTIDAD END) AS PRIMERA_CANTIDAD,
                                        SUM(CASE 
                                            WHEN PD.[STATUS] = 'NO PAGADO' 
                                                AND PD.[FECHA_VENCIMIENTO] < CONVERT(date, GETUTCDATE() AT TIME ZONE 'UTC' AT TIME ZONE 'Central Standard Time (Mexico)')
                                            THEN 1 
                                            ELSE 0 
                                        END) AS NUMERO_DE_ATRASOS,
                                        MAX(CASE 
                                            WHEN PD.[STATUS] = 'NO PAGADO' 
                                                AND PD.PROMESA_PAGO IS NOT NULL 
                                            THEN PD.[PROMESA_PAGO] 
                                        END) AS ULTIMA_PROMESA,
                                        MAX(NUMERO_SEMANA) AS [NUM_SEMANA_PRESTAMO]
                                    FROM (
                                        SELECT 
                                            *,
                                            ROW_NUMBER() OVER (PARTITION BY ID_PRESTAMO ORDER BY (SELECT NULL)) AS RN
                                        FROM [dbo].[PRESTAMOS_DETALLE]
                                        WHERE ID_PRESTAMO IN (SELECT ID FROM CTE_PrestamosBase)
                                    ) PD
                                    GROUP BY PD.ID_PRESTAMO
                                ),
                                CTE_UltimoPago AS (
                                    SELECT 
                                        ID_PRESTAMO,
                                        MAX(FECHA) AS FECHA_ULTIMO_PAGO,
                                        MAX(NUMERO_SEMANA) AS [NUMERO_SEMANA],
                                        COUNT(NUMERO_SEMANA) AS [NUMERO_DE_PAGOS_REALIZADOS]
                                    FROM [dbo].[PAGOS]
                                    WHERE ID_PRESTAMO IN (SELECT ID FROM CTE_PrestamosBase)
                                        AND [CANCELADO] = 'N'
                                    GROUP BY ID_PRESTAMO
                                )

                                SELECT
                                    PB.DIA_SEMANA AS [diaDePago],
                                    PB.ID_CLIENTE AS [id_cliente],
                                    T2.NOMBRE AS [nombreCliente],
                                    PB.ID AS [folioDeCredito],
                                    DP.NUM_SEMANA_PRESTAMO as [totalSemanasPrestamo],
                                    DP.PRIMERA_CANTIDAD AS [montoPago],
                                    UP.FECHA_ULTIMO_PAGO AS [fechaUltimoPago],
                                    ISNULL(UP.[NUMERO_SEMANA], 0) AS [pagoActual],
                                    ISNULL(DP.NUMERO_DE_ATRASOS, 0) AS [numeroAtrasos],                                    
                                    DP.NUM_SEMANA_PRESTAMO - ISNULL(UP.[NUMERO_SEMANA], 0) AS [pagosRestante],
                                    ISNULL(UP.[NUMERO_DE_PAGOS_REALIZADOS], 0) AS [totalPagos],
                                    PB.FECHA_FINAL_ESTIMADA AS [fechaVencimiento],
                                    PB.[NOMBRE_GRUPO] AS [nombreGrupo],
                                    PB.[NOMBRE_GERENCIA] AS [nombreGerencia],
                                    PB.[CANTIDAD_PRESTADA] AS [montoPrestamo],
                                    PB.[CANTIDAD_RESTANTE] AS [saldoPendiente]

                                FROM 
                                    CTE_PrestamosBase PB
                                    LEFT JOIN [dbo].[CLIENTES] T2 ON PB.ID_CLIENTE = T2.ID
                                    LEFT JOIN CTE_DetallesPrestamos DP ON PB.ID = DP.ID_PRESTAMO
                                    LEFT JOIN CTE_UltimoPago UP ON PB.ID = UP.ID_PRESTAMO

                                ${whereFilterSelectedData}

                                ;

    `;

  return cteQuery;
}
