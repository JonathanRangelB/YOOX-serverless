import { RolesDeUsuario } from "../../helpers/utils";

export const outstandingCollectionSchema = {
  type: "object",

  properties: {
    id_usuario: { type: "integer" },
    rol_usuario: {
      type: "string",
      enum: [
        RolesDeUsuario.ADMINISTRADOR,
        RolesDeUsuario.COBRADOR,
        RolesDeUsuario.LIDER_DE_GRUPO,
        RolesDeUsuario.USUARIO_NORMAL,
      ],
    },
    userIdFilter: { type: "integer" },
    groupIdFilter: { type: "integer" },
    managementIdFilter: { type: "integer" },
  },

  required: ["id_usuario", "rol_usuario"],

  oneOf: [
    {
      required: ["userIdFilter"],
      not: {
        anyOf: [
          { required: ["groupIdFilter"] },
          { required: ["managementIdFilter"] },
        ],
      },
    },
    {
      required: ["groupIdFilter"],
      not: {
        anyOf: [
          { required: ["userIdFilter"] },
          { required: ["managementIdFilter"] },
        ],
      },
    },
    {
      required: ["managementIdFilter"],
      not: {
        anyOf: [
          { required: ["userIdFilter"] },
          { required: ["groupIdFilter"] },
        ],
      },
    },
    {
      not: {
        anyOf: [
          { required: ["userIdFilter"] },
          { required: ["groupIdFilter"] },
          { required: ["managementIdFilter"] },
        ],
      },
    },
  ],

  additionalProperties: false,
};
