import { accessByUserRolTable } from "../../secure-data-access/getAccessByUserRol"

export function loanRequestListSearchQuery(id_usuario: number, rol_usuario: string): string {
    let whereCondition = ` `
    let cteQuery = ` WITH 
                    `

    switch (rol_usuario) {
        case 'Líder de grupo':
            const groupLeaderAccess = accessByUserRolTable(id_usuario, rol_usuario)
            cteQuery += groupLeaderAccess
            whereCondition = ` WHERE ID_AGENTE IN  (SELECT ID FROM LIDER_GRUPO_TABLA) `
            break
        case 'Cobrador':
            whereCondition = ` WHERE ID_AGENTE = ${id_usuario} `
            break;
    }

    cteQuery += `
            LOAN_REQUEST_LIST_TABLA AS (
                SELECT
                request_number,
                nombre_cliente + ' ' + apellido_paterno_cliente + ' ' + apellido_materno_cliente  as [nombre_cliente],
                cantidad_prestada,
                created_date,
                loan_request_status

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
                    AND 
                    CONVERT(DATE, created_date) BETWEEN DATEADD(WEEK, -1, CONVERT(DATE, GETDATE())) AND CONVERT(DATE, GETDATE())
                ) AS TAB

                ${whereCondition}
           
        )
    
        SELECT * FROM LOAN_REQUEST_LIST_TABLA 
        ORDER BY LOAN_REQUEST_STATUS, request_number desc
    
    `

    console.log(cteQuery)

    return cteQuery;

    // return `
    //         SELECT
    //         request_number,
    //         nombre_cliente + ' ' + apellido_paterno_cliente + ' ' + apellido_materno_cliente  as [nombre_cliente],
    //         cantidad_prestada,
    //         created_date,
    //         loan_request_status

    //         FROM
    //         (
    //             SELECT
    //             request_number,
    //             nombre_cliente,
    //             apellido_materno_cliente,
    //             apellido_paterno_cliente,
    //             cantidad_prestada,
    //             created_date,
    //             loan_request_status,
    //             id_agente
    //             FROM
    //             LOAN_REQUEST
    //             WHERE
    //             LOAN_REQUEST_STATUS IN ('EN REVISION', 'ACTUALIZAR')

    //             UNION

    //             SELECT
    //             request_number,
    //             nombre_cliente,
    //             apellido_materno_cliente,                
    //             apellido_paterno_cliente,
    //             cantidad_prestada,
    //             created_date,
    //             loan_request_status,
    //             id_agente
    //             FROM
    //             LOAN_REQUEST
    //             WHERE
    //             LOAN_REQUEST_STATUS IN ('APROBADO', 'RECHAZADO') 
    //             AND 
    //             CONVERT(DATE, created_date) BETWEEN DATEADD(WEEK, -1, CONVERT(DATE, GETDATE())) AND CONVERT(DATE, GETDATE())
    //         ) AS TAB

    //         ${whereCondition}

    //         ORDER BY LOAN_REQUEST_STATUS, request_number desc    

    // `;
}
