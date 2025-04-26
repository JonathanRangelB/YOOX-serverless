export function guarantorSearchQuery(
  id_aval?: number,
  curp_aval?: string,
  nombre_aval?: string
): string {
  let whereCondition = ` where t1.id_cliente is null `;

  if (id_aval) {
    whereCondition += ` and t1.id_aval = ${id_aval} `;
  } else if (curp_aval) {
    whereCondition += ` and t1.curp = '${curp_aval}' `;
  } else if (nombre_aval) {
    whereCondition += ` and t1.nombre like '%${nombre_aval.replace(/ /g, '%')}%' `;
  }

  return `select top 20
                t1.id_aval
                ,t1.nombre
                ,t1.telefono_fijo
                ,t1.telefono_movil
                ,t1.correo_electronico
                ,t1.curp
                ,t1.id_domicilio
                ,t2.tipo_calle as tipo_calle
                ,case
                    when t1.id_domicilio is null then t1.calle
                    else t2.nombre_calle
                end as [nombre_calle],
                case
                    when t1.id_domicilio is null then t1.numero_exterior
                    else t2.numero_exterior
                end as [numero_exterior],
                case
                    when t1.id_domicilio is null then t1.numero_interior
                    else t3.numero_interior
                end as [numero_interior],
                case
                    when t1.id_domicilio is null then t1.colonia
                    else t2.colonia
                end as [colonia],
                case
                    when t1.id_domicilio is null then t1.municipio
                    else t2.municipio
                end as [municipio],
                t2.estado as [estado],
                case
                    when t1.id_domicilio is null then t1.codigo_postal
                    else t2.cp
                end as [cp],
                t2.referencias as referencias_dom

            from 
                avales t1
                left join domicilios t2 on
                    t1.id_domicilio = t2.id
                left join domicilios_num_interior t3 on
                    t2.id = t3.id_domicilio
                    and t1.id_aval = t3.id_aval
            
            ${whereCondition}

            order by t1.id_aval
    `;
}
