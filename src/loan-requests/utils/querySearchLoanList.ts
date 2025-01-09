import { accessByUserRolTable } from '../../secure-data-access/getAccessByUserRol';
import { DatosSolicitudPrestamoLista } from '../types/loanRequest';

export function loanRequestListSearchQuery(
  datosSolicitudPrestamoLista: DatosSolicitudPrestamoLista
): string {
  const {
    id_usuario,
    rol_usuario,
    offSetRows,
    fetchRowsNumber,
    status,
    nombreCliente,
    folio,
  } = datosSolicitudPrestamoLista;
  let whereCondition = ` `;
  let limitOneWeekData = ` `;
  let cteQuery = ` WITH 
                    `;

  switch (rol_usuario) {
    case 'Líder de grupo': {
      const groupLeaderAccess = accessByUserRolTable(id_usuario, rol_usuario);
      cteQuery += groupLeaderAccess;
      whereCondition = ` WHERE ID_AGENTE IN  (SELECT ID FROM LIDER_GRUPO_TABLA) `;
      break;
    }
    case 'Cobrador':
      whereCondition = ` WHERE ID_AGENTE = ${id_usuario} `;
      limitOneWeekData = ` AND CONVERT(DATE, created_date) BETWEEN DATEADD(WEEK, -1, CONVERT(DATE, GETDATE())) AND CONVERT(DATE, GETDATE()) `;
      break;
  }

  if (status) whereCondition += `AND LOAN_REQUEST_STATUS = '${status}' `;
  if (nombreCliente)
    whereCondition += `AND CONCAT(NOMBRE_CLIENTE, ' ', APELLIDO_PATERNO_CLIENTE, ' ', APELLIDO_MATERNO_CLIENTE) LIKE '%${nombreCliente.replace(/ /g, '%')}%' `;
  if (folio) whereCondition += `AND REQUEST_NUMBER = '${folio}' `;

  cteQuery += `
            LOAN_REQUEST_LIST_TABLA AS (
                SELECT
                TAB.request_number,
                TAB.nombre_cliente + ' ' + TAB.apellido_paterno_cliente + ' ' + TAB.apellido_materno_cliente  as [nombre_cliente],
                TAB.cantidad_prestada,
                TAB.created_date,
                TAB.loan_request_status,
                TAB.ID_AGENTE,
                U.NOMBRE as nombre_agente

                FROM
                (
                    SELECT
                    request_number,
                    nombre_cliente,
                    apellido_materno_cliente,
                    apellido_paterno_cliente,
                    cantidad_prestada,
                    created_date,
                    loan_request_status,
                    id_agente
                    FROM
                    LOAN_REQUEST
                    WHERE
                    LOAN_REQUEST_STATUS IN ('EN REVISION', 'ACTUALIZAR')

                    UNION

                    SELECT
                    request_number,
                    nombre_cliente,
                    apellido_materno_cliente,                
                    apellido_paterno_cliente,
                    cantidad_prestada,
                    created_date,
                    loan_request_status,
                    id_agente
                    FROM
                    LOAN_REQUEST
                    WHERE
                    LOAN_REQUEST_STATUS IN ('APROBADO', 'RECHAZADO') 
                    ${limitOneWeekData}
                ) AS TAB
                LEFT JOIN USUARIOS U ON TAB.ID_AGENTE = U.ID

                ${whereCondition}
           
        )
    
        SELECT *, COUNT(*) OVER() AS CNT
        FROM LOAN_REQUEST_LIST_TABLA 
        ORDER BY LOAN_REQUEST_STATUS, request_number ASC
        OFFSET ${offSetRows} ROWS
        FETCH NEXT ${fetchRowsNumber} ROWS ONLY
    
    `;
  return cteQuery;
}
