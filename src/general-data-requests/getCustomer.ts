import { DbConnector } from '../helpers/dbConnector';
import { ClienteDomicilio, DatosCliente } from './types/getCustomer.interface';

module.exports.handler = async (event: any) => {
  const { id, curp, nombre } = JSON.parse(event.body) as DatosCliente;

  try {
    const pool = await DbConnector.getInstance().connection;

    let whereCondition = ` where `

    if (id) {
      whereCondition += `clientes.id = ${id} `
    } else if (curp) {
      whereCondition += `clientes.curp = '${curp}' `
    } else if (nombre) {
      whereCondition += `clientes.nombre like '%${nombre.replace(/ /g, "%")}%' `
    }

    const queryStatement = `select top 10
                          clientes.id,
                          clientes.nombre,
                          clientes.telefono_fijo,
                          clientes.telefono_movil,
                          clientes.correo_electronico ,
                          clientes.observaciones,
                          clientes.id_agente,
                          t1.nombre as [nombre_agente],
                          clientes.ocupacion,
                          clientes.curp,
                          clientes.id_domicilio,                                                        
                          t2.tipo_calle,
                          case when clientes.id_domicilio is null then clientes.calle else t2.nombre_calle end as [nombre_calle],
                          case when clientes.id_domicilio is null then clientes.numero_exterior else t2.numero_exterior end as [numero_exterior],
                          case when clientes.id_domicilio is null then clientes.numero_interior else t3.numero_interior end as [numero_interior],
                          case when clientes.id_domicilio is null then clientes.colonia else t2.colonia end as [colonia],
                          case when clientes.id_domicilio is null then clientes.municipio else t2.municipio end as [municipio],
                          t2.estado,
                          case when clientes.id_domicilio is null then clientes.codigo_postal else t2.cp end as [cp],
                          t2.referencias

                          from
                          clientes 
                          left join usuarios t1 on clientes.id_agente=t1.id  
                          left join domicilios t2 on clientes.id_domicilio=t2.id
                          left join domicilios_num_interior t3 on t2.id=t3.id_domicilio 
                            and clientes.id=t3.id_cliente 

                          ${whereCondition}
                                  
                          order by clientes.id ;`

    console.log(queryStatement)

    // Asegúrate de que cualquier elemento esté correctamente codificado en la cadena de conexión URL
    const registrosEncontrados = await pool
      .request()
      .query<ClienteDomicilio>(queryStatement);

    return { registrosEncontrados };
  } catch (err) {
    return { err };
  }
}


// {
//   "id": 7261,
//   "curp": "BEGO860616HVZRRR01"
//   "nombre": "MARIANO",
// }