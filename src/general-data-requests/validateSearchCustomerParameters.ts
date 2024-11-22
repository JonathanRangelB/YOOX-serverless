import Ajv from 'ajv';
import formats from 'ajv-formats';

import { customerSearchParametersSchema } from './schemas/customer.schema';
import { DatosCliente, validateSearchCustomerParametersResponse } from './types/getCustomer.interface';


const ajv = new Ajv({ allErrors: true });
formats(ajv);

export function isValidSearchCustomerParameters(
    datosCliente: DatosCliente
): validateSearchCustomerParametersResponse {
    const validate = ajv.compile(customerSearchParametersSchema);
    const valid = validate(datosCliente);
    const error = ajv.errorsText(validate.errors, { separator: ' AND ' });

    if (!valid) {
        return { valid, error };
    }
    return { valid };
}