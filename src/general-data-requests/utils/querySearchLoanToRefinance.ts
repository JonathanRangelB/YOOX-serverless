export function querySearchLoanToRefinance(): String {
    return `
    select
                t0.id as id_prestamo,
                t0.id_cliente,
                t0.cantidad_restante

                from
                prestamos t0
                left join (
                    select
                    id_prestamo,
                    count(*) as num_de_pagos
                    
                    from prestamos_detalle pd 
                    
                    where
                    numero_semana between 1 and 10
                    and pd.status = 'PAGADO'
                    
                    group by id_prestamo
                ) t1 on t0.id = t1.id_prestamo

                where
                t0.status = 'EMITIDO'
                and t1.num_de_pagos = 10
                `
}