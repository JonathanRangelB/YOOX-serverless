import { accessByUserRolTable } from "../../secure-data-access/getAccessByUserRol";
import { DatosSolicitudPrestamoLista } from "../types/loanRequest";
import { RolesDeUsuario } from "../../helpers/utils";

export function loanRequestListSearchQuery(
  datosSolicitudPrestamoLista: DatosSolicitudPrestamoLista
): string {
  const {
    id_usuario,
    rol_usuario,
    status,
    nombreCliente,
    folio,
    userIdFilter,
    groupIdFilter,
    managementIdFilter
  } = datosSolicitudPrestamoLista;
  let whereCondition = "";
  let limitOneWeekData = "";
  let cteQuery = ` WITH
                    `;

  switch (rol_usuario) {
    case RolesDeUsuario.LIDER_DE_GRUPO: {
      const groupLeaderAccess = accessByUserRolTable(id_usuario, rol_usuario);
      cteQuery += groupLeaderAccess;
      whereCondition = `WHERE ID_AGENTE IN  (SELECT ID FROM LIDER_GRUPO_TABLA) `;
      break;
    }
    case RolesDeUsuario.COBRADOR:
      whereCondition = `WHERE ID_AGENTE = ${id_usuario} `;
      limitOneWeekData = ` AND CONVERT(DATE, created_date) BETWEEN DATEADD(WEEK, -1, CONVERT(DATE, GETDATE())) AND CONVERT(DATE, GETDATE()) `;
      break;
  }

  if (status)
    whereCondition += ` ${whereCondition ? " AND " : " WHERE "}  LOAN_REQUEST_STATUS = '${status}' `;
  if (nombreCliente)
    whereCondition += ` ${whereCondition ? " AND " : " WHERE "}  CONCAT(NOMBRE_CLIENTE, ' ', APELLIDO_PATERNO_CLIENTE, ' ', APELLIDO_MATERNO_CLIENTE) LIKE '%${nombreCliente.replace(/ /g, "%")}%' `;
  if (folio)
    whereCondition += ` ${whereCondition ? " AND " : " WHERE "}  REQUEST_NUMBER = '${folio}' `;

  let hierarchyFilter = ""

  if (userIdFilter) {
    hierarchyFilter = ` ${whereCondition ? " AND " : " WHERE "} TAB.ID_AGENTE = ${userIdFilter} `;
  } else if (groupIdFilter) {
    hierarchyFilter = ` ${whereCondition ? " AND " : " WHERE "} GA.ID_GRUPO = ${groupIdFilter} `;
  } else if (managementIdFilter) {
    hierarchyFilter = ` ${whereCondition ? " AND " : " WHERE "} GG.ID_GERENCIA = ${managementIdFilter} `;
  }

  whereCondition += hierarchyFilter;

  cteQuery += `
            LOAN_REQUEST_LIST_TABLA AS (
                SELECT
                TAB.request_number,
                TAB.nombre_cliente,
                TAB.apellido_paterno_cliente,
                TAB.apellido_materno_cliente,
                TAB.cantidad_prestada,
                TAB.created_date,
                TAB.loan_request_status,
                TAB.ID_AGENTE,
                U.NOMBRE as nombre_agente,
                GA.ID_GRUPO,
                GA.NOMBRE AS [NOMBRE_GRUPO],
                GG.ID_GERENCIA,
                GG.NOMBRE AS [NOMBRE_GERENCIA]

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
                LEFT JOIN GRUPOS_AGENTES GA ON GA.ID_GRUPO = U.ID_GRUPO
                LEFT JOIN GERENCIAS_GRUPOS GG ON GG.ID_GERENCIA = GA.ID_GERENCIA                

                ${whereCondition}
        )
        SELECT *, COUNT(*) OVER() AS CNT
        FROM LOAN_REQUEST_LIST_TABLA;
    `;

  return cteQuery;
}

export function getGroupUsers(id_usuario: number, rol_usuario: string): string {
  let whereCondition = "";
  let cteQuery = ` WITH
                    `;

  switch (rol_usuario) {
    case RolesDeUsuario.LIDER_DE_GRUPO: {
      const groupLeaderAccess = accessByUserRolTable(id_usuario, rol_usuario);
      cteQuery += groupLeaderAccess;
      whereCondition = ` WHERE U.ID IN (SELECT ID FROM LIDER_GRUPO_TABLA) `;
      break;
    }
    case RolesDeUsuario.COBRADOR:
      whereCondition = ` WHERE U.ID = ${id_usuario} `;
      break;

    default: {
      whereCondition = ` WHERE U.ROL IN ('Líder de grupo', 'Cobrador') `;
    }
  }

  cteQuery += `
    LOAN_REQUEST_LIST_TABLA AS (
                SELECT
                U.ID,
                U.NOMBRE
 				
                FROM
                USUARIOS U 
                
                ${whereCondition}
                        )
        SELECT *
        FROM LOAN_REQUEST_LIST_TABLA
        ORDER BY NOMBRE ASC;
    `;

  return cteQuery;
}

export function getGroupsListOfUser(
  id_usuario: number,
  rol_usuario: string
): string {
  let whereCondition = "";
  let querySelect = "";

  switch (rol_usuario) {
    case RolesDeUsuario.LIDER_DE_GRUPO:
    case RolesDeUsuario.COBRADOR:
      whereCondition = ` AND ID_GRUPO = (SELECT ID_GRUPO FROM USUARIOS WHERE ID = ${id_usuario}) `;
      break;

    default: {
      whereCondition = `  `;
    }
  }

  querySelect = `SELECT 
                      ID_GRUPO AS ID
                      , NOMBRE

                  FROM
                      GRUPOS_AGENTES

                  WHERE
                    ACTIVO=1                       
                    ${whereCondition}

                  ORDER BY 
                    ID_GRUPO;

                      `;

  return querySelect;
}

export function getManagementListOfUser(
  id_usuario: number,
  rol_usuario: string
): string {
  let whereCondition = "";
  let querySelect = "";

  switch (rol_usuario) {
    case RolesDeUsuario.LIDER_DE_GRUPO:
    case RolesDeUsuario.COBRADOR:
      whereCondition = ` WHERE ID_GERENCIA IN 
                          (
                          SELECT DISTINCT
                          ID_GERENCIA

                          FROM
                          GRUPOS_AGENTES

                          WHERE
                          ID_GRUPO = (SELECT ID_GRUPO FROM USUARIOS WHERE ID=${id_usuario})
                          ) `;
      break;

    default: {
      whereCondition = `  `;
    }
  }

  querySelect = `SELECT
                    ID_GERENCIA AS ID
                    ,NOMBRE

                    FROM
                    GERENCIAS_GRUPOS

                    ${whereCondition}

                    ORDER BY
                    ID_GERENCIA;
                      `;

  return querySelect;
}
