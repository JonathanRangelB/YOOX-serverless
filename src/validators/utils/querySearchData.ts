export function searchCurpQuery(curp: string, table: string): string {
  let selectStatement = ``;
  const whereCondition = ` where CURP = '${curp}' `;

  switch (table) {
    case 'CLIENTES':
      selectStatement = `select 
                          id 
                          from `;
      break;

    case 'AVALES':
      selectStatement = `select 
                          id_aval as [id]
                          from `;
      break;
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
                          id_aval as [id]
                          from `;
      break;
  }

  let listInCondition = '';

  if (telefono_fijo) listInCondition += `'${telefono_fijo}'`;

  if (telefono_movil) {
    if (listInCondition.length > 0) listInCondition += `,`;

    listInCondition += `'${telefono_movil}'`;
  }

  selectStatement += `
                          ${table}
                          where telefono_fijo in (${listInCondition})
                                or telefono_movil in (${listInCondition})  `;

  console.log('Where st string: ' + selectStatement)

  return selectStatement;
}
