export function customerSearchQuery(
  id_agente: number,
  id_cliente: number,
  curp: string,
  nombre_cliente: string
): string {
  let whereCondition = ` where clientes.id_agente = ${id_agente} and clientes.activo = 1 and `;

  if (id_cliente) {
    whereCondition += `clientes.id = ${id_cliente} `;
  } else if (curp) {
    whereCondition += `clientes.curp = '${curp}' `;
  } else if (nombre_cliente) {
    whereCondition += `clientes.nombre like '%${nombre_cliente.replace(/ /g, '%')}%' `;
  }

  return `with t_clientes as (
                                  select
                                    top 5
                                                            clientes.id as [id_cliente],
                                    clientes.nombre as [nombre_cliente],
                                    clientes.telefono_fijo as [telefono_fijo_cliente],
                                    clientes.telefono_movil as [telefono_movil_cliente],
                                    clientes.correo_electronico as [correo_electronico_cliente],
                                    clientes.id_agente,
                                    t1.nombre as [nombre_agente],
                                    clientes.ocupacion as [ocupacion_cliente],
                                    clientes.curp as [curp_cliente],
                                    clientes.id_domicilio as [id_domicilio_cliente],
                                    t2.tipo_calle as [tipo_calle_cliente],
                                    case
                                      when clientes.id_domicilio is null then clientes.calle
                                      else t2.nombre_calle
                                    end as [nombre_calle_cliente],
                                    case
                                      when clientes.id_domicilio is null then clientes.numero_exterior
                                      else t2.numero_exterior
                                    end as [numero_exterior_cliente],
                                    case
                                      when clientes.id_domicilio is null then clientes.numero_interior
                                      else t3.numero_interior
                                    end as [numero_interior_cliente],
                                    case
                                      when clientes.id_domicilio is null then clientes.colonia
                                      else t2.colonia
                                    end as [colonia_cliente],
                                    case
                                      when clientes.id_domicilio is null then clientes.municipio
                                      else t2.municipio
                                    end as [municipio_cliente],
                                    t2.estado as [estado_cliente],
                                    case
                                      when clientes.id_domicilio is null then clientes.codigo_postal
                                      else t2.cp
                                    end as [cp_cliente],
                                    t2.referencias as [referencias_dom_cliente]
                                  from
                                    clientes
                                  left join usuarios t1 on
                                    clientes.id_agente = t1.id
                                  left join domicilios t2 on
                                    clientes.id_domicilio = t2.id
                                  left join domicilios_num_interior t3 on
                                    t2.id = t3.id_domicilio
                                    and clientes.id = t3.id_cliente

                                    ${whereCondition}


                                  order by
                                    clientes.id 
                                                            
                                  )

                                  ,
                                  t_keys as (
                                  select
                                    
                                        id_cliente,
                                    id_aval
                                  from
                                      (
                                    select
                                        * 
                                        ,
                                      row_number() over (partition by id_cliente
                                    order by
                                              ranked desc) as row_no
                                    from
                                        (
                                      select
                                            id_aval,
                                            id_cliente,
                                            row_number() over (partition by id_cliente
                                      order by
                                            id_cliente) as ranked
                                      from
                                            CLIENTES_AVALES
                                      where
                                        id_cliente in (
                                        select
                                          id_cliente
                                        from
                                          t_clientes)					
                                            
                                            ) as t
                                        
                                        ) as u
                                  where
                                    row_no = 1

                                  )

                                  select
                                    c.*
                                  ,
                                    a.id_aval,
                                    a.nombre as [nombre_aval],
                                    a.telefono_fijo as [telefono_fijo_aval],
                                    a.telefono_movil as [telefono_movil_aval],
                                    a.correo_electronico as [correo_electronico_aval],
                                    a.curp as [curp_aval],
                                    a.id_domicilio as [id_domicilio_aval],
                                    d.tipo_calle as [tipo_calle_aval],
                                    case
                                      when a.id_domicilio is null then a.calle
                                      else d.nombre_calle
                                    end as [nombre_calle_aval],
                                    case
                                      when a.id_domicilio is null then a.numero_exterior
                                      else d.numero_exterior
                                    end as [numero_exterior_aval],
                                    case
                                      when a.id_domicilio is null then a.numero_interior
                                      else ni.numero_interior
                                    end as [numero_interior_aval],
                                    case
                                      when a.id_domicilio is null then a.colonia
                                      else d.colonia
                                    end as [colonia_aval],
                                    case
                                      when a.id_domicilio is null then a.municipio
                                      else d.municipio
                                    end as [municipio_aval],
                                    d.estado as [estado_aval],
                                    case
                                      when a.id_domicilio is null then a.codigo_postal
                                      else d.cp
                                    end as [cp_aval],
                                    d.referencias as [referencias_dom_aval]
                                  from
                                    t_clientes as c
                                  left join t_keys as k on
                                    c.id_cliente = k.id_cliente
                                  left join AVALES a on
                                    a.ID_AVAL = k.id_aval
                                  left join DOMICILIOS d on
                                    a.ID_DOMICILIO = d.ID
                                  left join domicilios_num_interior ni on
                                    d.id = ni.id_domicilio
                                    and c.id_cliente = ni.id_cliente                           
                         
  
  ;       `;
}
