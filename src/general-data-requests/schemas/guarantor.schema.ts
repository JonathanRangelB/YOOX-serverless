export const guarantorSearchParametersSchema = {
    type: 'object',

    properties: {
        id: {
            type: 'integer', nullable: true
        },

        curp: {
            type: 'string', nullable: true
        },

        nombre: {
            type: 'string', nullable: true
        }
    }

    ,

    if: {
        required: ['id'],
        properties: {
            id: { minimum: 1 },
        },
    },
    then: {
        properties: {
            curp: { type: 'string', nullable: true },
            nombre: { type: 'string', nullable: true },
        },
    },
    else: {
        if: {
            required: ['curp'],
            properties: {
                curp: { pattern: '^([A-Z][AEIOUX][A-Z]{2}\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\\d])(\\d)$' }, // Aquí va el pattern correcto
            },
        },
        then: {
            properties: {
                nombre: { type: 'string', nullable: true },
            },
        },
        else: {
            required: ['nombre'],
            properties: {
                nombre: { minLength: 1, pattern: '\\S+' },
            },
        },
    }

    , additionalProperties: false,
};