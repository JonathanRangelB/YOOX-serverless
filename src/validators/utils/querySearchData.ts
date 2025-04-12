export function searchCurpQuery(curp: string, table: string): string {
  const whereCondition = ` where CURP = '${curp}' `;

  let selectStatement = (table && mapTableName(table)) || '';

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
  let selectStatement = (table && mapTableName(table)) || '';

  let listInCondition = '';

  if (telefono_fijo) listInCondition += `'${telefono_fijo}'`;

  if (telefono_movil) {
    if (listInCondition.length > 0) listInCondition += `,`;

    listInCondition += `'${telefono_movil}'`;
  }

  selectStatement += `
                          ${table}
                          where (telefono_fijo in (${listInCondition})
                                or telefono_movil in (${listInCondition}))  `;

  return selectStatement;
}

function mapTableName(table: string): string {
  const selectStatementMap: Record<string, string> = {
    CLIENTES: `select 
                          id 
                          from `,
    AVALES: `select 
                          id_aval as [id]
                          from `,
  };

  return selectStatementMap[table];
}
