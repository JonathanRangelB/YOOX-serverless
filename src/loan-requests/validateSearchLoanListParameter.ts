import Ajv from 'ajv';
import formats from 'ajv-formats';

import { loanRequestListSearchParametersSchema } from './schemas/loanList.schema';
import { DatosSolicitudPrestamoLista, validateSearchLoanRequestListResponse } from './types/loanRequest';

const ajv = new Ajv({ allErrors: true })
formats(ajv);

export function isValidSearchLoanRequestListParameter(
    datosSolicitudLista: DatosSolicitudPrestamoLista
): validateSearchLoanRequestListResponse {
    const validate = ajv.compile(loanRequestListSearchParametersSchema)
    const valid = validate(datosSolicitudLista)
    const error = ajv.errorsText(validate.errors, { separator: ' AND ' })

    if (!valid) {
        return { valid, error }
    }

    return { valid }
}
