import { RolesDeUsuario } from "../../helpers/utils";

export const loanRequestListSearchParametersSchema = {
  type: 'object',

  properties: {
    id_usuario: { type: 'number' },
    rol_usuario: {
      type: 'string',
      enum: [RolesDeUsuario.ADMINISTRADOR, RolesDeUsuario.COBRADOR, RolesDeUsuario.LIDER_DE_GRUPO, RolesDeUsuario.USUARIO_NORMAL]
    },
    offSetRows: { type: 'number' },
    fetchRowsNumber: { type: 'number' },
    status: { type: 'string' },
    nombre_cliente: { type: 'string' },
    folio: { type: 'string' },
  },

  required: ['id_usuario', 'rol_usuario', 'offSetRows', 'fetchRowsNumber'],

  additionalProperties: true,
};
