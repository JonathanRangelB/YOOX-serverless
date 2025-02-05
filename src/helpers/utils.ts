import { toZonedTime } from 'date-fns-tz';
import Ajv from 'ajv';
import formats from 'ajv-formats';
import {
  AdditionalProperties,
  validateLoanResponse,
} from '../loan-requests/types/validateLoanResponse';

export function convertToBase36(intValue: number) {
  return intValue.toString(36).padStart(6, '0').toUpperCase();
}

export function convertFromBase36ToNumber(base36Value: string) {
  return parseInt(base36Value, 36);
}

/**
 * Convierte una fecha de tipo UTC a hora local de la zona horaria especificada.
 * @param {Date} dateUTC - Fecha UTC a convertir a hora local
 * @param {string} timeZone - Nombre de la zona horaria a convertir la fecha `dateUTC`.
 * Solo valores validos por [IANA]{@link https://www.iana.org/time-zones}
 * listado completo en [timezonedb]{@link https://timezonedb.com/time-zones}
 * @param {string} locale - Si se proporciona regresa la fecha resuelta pero como string localizado.
 * @returns {string | Date}
 */
export function convertDateTimeZone(
  dateUTC: Date,
  timeZone: string,
  locale?: string
): string | Date {
  // hace el calculo necesario entre fechas UTC y regresa una fecha igualmente UTC
  const formatedDate = toZonedTime(dateUTC, timeZone);
  // crea un objeto date en horario local (del sistema) basandose en el offset correspondiente de la fecha UTC
  const localDate = new Date(
    formatedDate.getTime() - formatedDate.getTimezoneOffset() * 60 * 1000
  );
  if (locale)
    // la siguiente linea regresa un string basandose en la fecha UTC y la convierte a la hora local especifica
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: timeZone,
    }).format(localDate);
  return localDate;
}

export function validatePayload(
  payload: any,
  schema: any
): validateLoanResponse {
  const ajv = new Ajv({ allErrors: true });
  formats(ajv);
  const validate = ajv.compile(schema);
  const valid = validate(payload);
  const error = ajv.errorsText(validate.errors, { separator: ' AND ' });
  const additionalProperties: AdditionalProperties[] = [];
  if (validate.errors) {
    additionalProperties.push(
      ...validate.errors
        .filter((error) => error.keyword === 'additionalProperties')
        .map((error) => ({
          propiedad: error.params.additionalProperty as string,
          path: error.instancePath || 'raíz del objeto',
        }))
    );
  }

  if (!valid) {
    return { valid, error, additionalProperties };
  }

  return { valid };
}
