export function querySearchLoanToRefinance(selectStatement: string): string {
  return `
  select
    ${selectStatement}
  from (
          select
          pd.id_prestamo as [id],
          p.id_cliente,
          p.id_cobrador,
          p.cantidad_restante,
          u.id as idUsuario,
          u.login,          
          pz.semanas_refinancia,
          count(*) as [num_de_pagos]
          
          from prestamos_detalle pd 
          left join prestamos p on pd.id_prestamo = p.id
          left join plazo pz on p.id_plazo = pz.id                    
          left join clientes c ON p.id_cliente = c.id
          left join usuarios u on c.id_agente = u.id
          
          where
          numero_semana between 1 and pz.semanas_refinancia
          and 
          pd.status = 'PAGADO'
          and
          p.status = 'EMITIDO' 
          
          group by 
          pd.id_prestamo,
          p.id_cliente,
          p.id_cobrador,
          p.cantidad_restante,
          u.id,
          u.login,                    
          pz.semanas_refinancia
          
          having count(*) >= pz.semanas_refinancia                      

  ) as t0  
  `;
}
