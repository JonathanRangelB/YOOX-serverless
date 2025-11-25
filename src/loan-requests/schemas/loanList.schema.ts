import { RolesDeUsuario } from "../../helpers/utils";

export const loanRequestListSearchParametersSchema = {
  type: "object",

  properties: {
    id_usuario: { type: "number" },
    rol_usuario: {
      type: "string",
      enum: [
        RolesDeUsuario.ADMINISTRADOR,
        RolesDeUsuario.COBRADOR,
        RolesDeUsuario.LIDER_DE_GRUPO,
        RolesDeUsuario.USUARIO_NORMAL,
      ],
    },
    status: { type: "string" },
    nombre_cliente: { type: "string" },
    folio: { type: "string" },
    userIdFilter: { type: "number" },
    groupIdFilter: { type: "number" },
    managementIdFilter: { type: "number" },
  },

  required: ["id_usuario", "rol_usuario"],

  additionalProperties: true,
};
