export function querySearchLoanToRefinance(selectStatement: string): string {
  return `
    select
                ${selectStatement}

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
                `;
}
