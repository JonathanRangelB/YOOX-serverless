export function accessByUserRolTable(
    idUsuario: number,
    rolDeUsuario: string
): string {
    let cteQuery = ``

    switch (rolDeUsuario) {
        case 'Líder de grupo':
            cteQuery += `
        LIDER_GRUPO_TABLA AS (
        SELECT ID FROM USUARIOS WHERE ACTIVO = 1 AND ID_GRUPO IN (SELECT ID_GRUPO FROM GRUPOS_AGENTES WHERE ACTIVO = 1 AND ID_LIDER_DE_GRUPO = ${idUsuario})
        ),
        
        `;

            break;
    }

    return cteQuery
}