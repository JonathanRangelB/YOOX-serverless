export function searchCurpQuery(
    id: number,
    curp: string,
    table: string
): string {

    let whereCondition = ` where CURP = '${curp}' `

    if (id) {
        switch (table) {
            case 'CLIENTES':
                whereCondition += ` and ID not in (${id})  `
                break;

            case 'AVALES':
                whereCondition += ` and ID_AVAL not in (${id})  `
                break;
        }
    }

    return `
        select 
        id 
        from 
        ${table}
        ${whereCondition}
    `
}