import Ajv from 'ajv';
import formats from 'ajv-formats';
import { customerSearchCURPSchema } from './schemas/personaCURP.schema';
import {
  DatosBusquedaCurp,
  DatosBusquedaTelefono,
  ValidateSearchCurpParametersResponse,
  ValidateSearchTelefonoParametersResponse,
} from './types/DatosBusqueda.interface';
import { customerSearchTelefonoSchema } from './schemas/personaTelefono.schema';

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

export function isValidSearchCustomerParametersTelefono(
  datosPersonaTelefono: DatosBusquedaTelefono
): ValidateSearchTelefonoParametersResponse {
  const validate = ajv.compile(customerSearchTelefonoSchema);
  const valid = validate(datosPersonaTelefono);
  const error = ajv.errorsText(validate.errors, { separator: ' AND ' });

  if (!valid) {
    return { valid, error };
  }
  return { valid };
}
