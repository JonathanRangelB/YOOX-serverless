export function requestListSearchQuery(
    id_agente: number
): string {
    return `
            SELECT
            request_number,
            apellido_paterno_cliente,
            cantidad_prestada,
            created_date,
            loan_request_status

            FROM
            (
                SELECT
                request_number,
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

            WHERE

            id_agente = ${id_agente}

            ORDER BY LOAN_REQUEST_STATUS, request_number desc    

    `
}
