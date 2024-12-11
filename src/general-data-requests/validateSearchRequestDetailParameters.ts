import Ajv from 'ajv';
import formats from 'ajv-formats';

import { requestDetailSearchParametersSchema } from './schemas/request.schema';
import {
  DatosSolicitudDetalle,
  validateSearchRequestDetailResponse,
} from './types/getRequest.interface';

const ajv = new Ajv({ allErrors: true });
formats(ajv);

export function isValidSearchRequestDetailParameter(
  datosSolicitudDetalle: DatosSolicitudDetalle
): validateSearchRequestDetailResponse {
  const validate = ajv.compile(requestDetailSearchParametersSchema);
  const valid = validate(datosSolicitudDetalle);
  const error = ajv.errorsText(validate.errors, { separator: ' AND ' });

  if (!valid) {
    return { valid, error };
  }

  return { valid };
}
