import Ajv from 'ajv';
import formats from 'ajv-formats';
import { customerSearchCURPSchema } from './schemas/personaCURP.schema';
import {
  DatosBusquedaCurp,
  ValidateSearchCurpParametersResponse,
} from './types/DatosBusqueda.interface';

const ajv = new Ajv({ allErrors: true });
formats(ajv);

export function isValidSearchCustomerParametersCurp(
  datosPersonaCURP: DatosBusquedaCurp
): ValidateSearchCurpParametersResponse {
  const validate = ajv.compile(customerSearchCURPSchema);
  const valid = validate(datosPersonaCURP);
  const error = ajv.errorsText(validate.errors, { separator: ' AND ' });

  if (!valid) {
    return { valid, error };
  }
  return { valid };
}
