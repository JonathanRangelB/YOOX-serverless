export function searchCurpQuery(
  id: number,
  curp: string,
  table: string
): string {
  let selectStatement = ``;
  let whereCondition = ` where CURP = '${curp}' `;

  switch (table) {
    case 'CLIENTES':
      selectStatement = `select 
                          id 
                          from `;
      break;

    case 'AVALES':
      selectStatement = `select 
                          id_aval 
                          from `;
      break;
  }

  if (id) {
    switch (table) {
      case 'CLIENTES':
        whereCondition += ` and ID not in (${id})  `;
        break;

      case 'AVALES':
        whereCondition += ` and ID_AVAL not in (${id})  `;
        break;
    }
  }

  selectStatement += `
                    ${table}
                    ${whereCondition}
                `;

  return selectStatement;
}

export function searchTelefonoQuery(
  telefono_fijo: string,
  telefono_movil: string,
  table: string
): string {
  let selectStatement = ``;

  switch (table) {
    case 'CLIENTES':
      selectStatement = `select 
                          id 
                          from `;
      break;

    case 'AVALES':
      selectStatement = `select 
                          id_aval 
                          from `;
      break;
  }

  let listInCondition = ``;

  if (telefono_fijo) listInCondition += `'${telefono_fijo}'`;

  if (telefono_movil) {
    if (listInCondition.length > 0) listInCondition += `,`;

    listInCondition += `'${telefono_movil}'`;
  }

  selectStatement += `
                          ${table}
                          where telefono_fijo in (${listInCondition})
                                or telefono_movil in (${listInCondition})  `;

  return selectStatement;
}
