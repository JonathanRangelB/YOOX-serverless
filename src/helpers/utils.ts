import { toZonedTime } from "date-fns-tz";
import Ajv from "ajv";
import formats from "ajv-formats";
import {
  AdditionalProperties,
  ValidateLoanResponse,
} from "../loan-requests/types/validateLoanResponse";

export function convertToBase36(intValue: number) {
  return intValue.toString(36).padStart(6, "0").toUpperCase();
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
      dateStyle: "full",
      timeStyle: "long",
      timeZone: timeZone,
    }).format(localDate);
  return localDate;
}

export function validatePayload(
  payload: any,
  schema: any
): ValidateLoanResponse {
  const ajv = new Ajv({ allErrors: true });
  formats(ajv);
  const validate = ajv.compile(schema);
  const valid = validate(payload);
  const error = ajv.errorsText(validate.errors, { separator: " AND " });
  const additionalProperties: AdditionalProperties[] = [];
  if (validate.errors) {
    additionalProperties.push(
      ...validate.errors
        .filter((error) => error.keyword === "additionalProperties")
        .map((error) => ({
          propiedad: error.params.additionalProperty as string,
          path: error.instancePath || "raíz del objeto",
        }))
    );
  }

  if (!valid) {
    return { valid, error, additionalProperties };
  }

  return { valid };
}

export const REGEX_CURP: string =
  "^([A-Z][AEIOUX][A-Z]{2}\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\\d])(\\d)$";
export const REGEX_EMAIL: string =
  "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
export const REGEX_ZIP_CODE: string = "^\\d{5}$";
export const REGEX_PHONE: string = "^\\d{10}$";

export const Status = {
  EN_REVISION: "EN REVISION",
  ACTUALIZAR: "ACTUALIZAR",
  APROBADO: "APROBADO",
  RECHAZADO: "RECHAZADO",
} as const;

// NOTE: esta es una forma de definir un tipo que es igual a las claves del objeto Status
export type Status = keyof typeof Status;

export const States = {
  JALISCO: "JALISCO",
  AGUASCALIENTES: "AGUASCALIENTES",
  BAJA_CALIFORNIA: "BAJA CALIFORNIA",
  BAJA_CALIFORNIA_SUR: "BAJA CALIFORNIA SUR",
  CAMPECHE: "CAMPECHE",
  COAHUILA: "COAHUILA",
  COLIMA: "COLIMA",
  CHIAPAS: "CHIAPAS",
  CHIHUAHUA: "CHIHUAHUA",
  DURANGO: "DURANGO",
  CDMX: "CDMX",
  GUANAJUATO: "GUANAJUATO",
  GUERRERO: "GUERRERO",
  HIDALGO: "HIDALGO",
  ESTADO_DE_MEXICO: "ESTADO DE MEXICO",
  MICHOACAN: "MICHOACAN",
  MORELOS: "MORELOS",
  NAYARIT: "NAYARIT",
  NUEVO_LEON: "NUEVO LEON",
  OAXACA: "OAXACA",
  PUEBLA: "PUEBLA",
  QUERETARO: "QUERETARO",
  QUINTANA_ROO: "QUINTANA ROO",
  SAN_LUIS_POTOSI: "SAN LUIS POTOSI",
  SINALOA: "SINALOA",
  SONORA: "SONORA",
  TABASCO: "TABASCO",
  TAMAULIPAS: "TAMAULIPAS",
  TLAXCALA: "TLAXCALA",
  VERACRUZ: "VERACRUZ",
  YUCATAN: "YUCATAN",
  ZACATECAS: "ZACATECAS",
} as const;

export const DiasDeSemana = {
  DOMINGO: "DOMINGO",
  LUNES: "LUNES",
  MARTES: "MARTES",
  MIERCOLES: "MIERCOLES",
  JUEVES: "JUEVES",
  VIERNES: "VIERNES",
  SABADO: "SABADO",
} as const;

export const RolesDeUsuario = {
  ADMINISTRADOR: "Administrador",
  COBRADOR: "Cobrador",
  LIDER_DE_GRUPO: "Líder de grupo",
  USUARIO_NORMAL: "Usuario normal",
} as const;

export const TipoCalles = {
  CALLE: "CALLE",
  AVENIDA: "AVENIDA",
  PROLONGACION: "PROLONGACION",
  CARRETERA: "CARRETERA",
  PRIVADA: "PRIVADA",
  BOULEVARD: "BOULEVARD",
} as const;
