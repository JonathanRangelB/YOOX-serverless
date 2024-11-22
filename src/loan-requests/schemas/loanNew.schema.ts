// TODO: Hacer las correcciones para los campos requeridos
import { propertiesForLoanRequest } from './propertiesForLoanRequest.schema';

export const loanSchema = {
  type: 'object',
  properties: propertiesForLoanRequest,
  required: [
    'cantidad_prestada',
    'id_agente',
    'created_by',
    'id_grupo_original',
    'fecha_final_estimada',
    'fecha_inicial',
    'dia_semana',
    'plazo',
    'cantidad_pagar',
  ],
  additionalProperties: false,
};
