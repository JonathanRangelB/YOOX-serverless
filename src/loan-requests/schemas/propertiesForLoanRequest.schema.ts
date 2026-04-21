import {
  REGEX_PHONE,
  REGEX_CURP,
  REGEX_EMAIL,
  REGEX_ZIP_CODE,
  Status,
  DiasDeSemana,
  States,
  TipoCalles,
  REGEX_EMPTY_STRING,
} from "../../helpers/utils";

export const propertiesForLoanRequest = {
  id: { type: "integer" },
  request_number: { type: "string" },
  loan_request_status: {
    type: "string",
    enum: Object.values(Status),
  },
  cantidad_prestada: { type: "number", minimum: 1000 },
  cantidad_pagar: { type: "number" },
  id_agente: { type: "integer" },
  id_grupo_original: { type: "integer" },
  fecha_inicial: {
    anyOf: [
      { type: "string", format: "date-time" },
      {
        type: "string",
        enum: [null],
        pattern: REGEX_EMPTY_STRING,
        nullable: true,
      },
    ],
  },
  fecha_final_estimada: {
    anyOf: [
      { type: "string", format: "date-time" },
      {
        type: "string",
        enum: [null],
        pattern: REGEX_EMPTY_STRING,
        nullable: true,
      },
    ],
  },
  dia_semana: {
    anyOf: [
      { type: "string", enum: Object.values(DiasDeSemana) },
      {
        type: "string",
        enum: [null],
        pattern: REGEX_EMPTY_STRING,
        nullable: true,
      },
    ],
  },
  observaciones: {
    anyOf: [
      { type: "string" },
      { type: "string", enum: ["", null], nullable: true },
    ],
  },

  plazo: {
    type: "object",
    properties: {
      semanas_plazo: { type: "string" },
      tasa_de_interes: { type: "integer" },
      id: { type: "integer" },
    },
  },

  formCliente: {
    type: "object",
    properties: {
      id_cliente: {
        anyOf: [
          { type: "integer" },
          { type: "integer", enum: ["", null], nullable: true },
        ],
      },
      nombre_cliente: { type: "string" },
      apellido_paterno_cliente: { type: "string" },
      apellido_materno_cliente: { type: "string" },
      telefono_fijo_cliente: {
        anyOf: [
          {
            type: "string",
            pattern: REGEX_PHONE,
          },
          { type: "string", enum: ["", null], nullable: true },
        ],
      },
      telefono_movil_cliente: {
        anyOf: [
          {
            type: "string",
            pattern: REGEX_PHONE,
          },
          { type: "string", enum: ["", null], nullable: true },
        ],
      },
      correo_electronico_cliente: {
        anyOf: [
          {
            type: "string",
            pattern: REGEX_EMAIL,
          },
          { type: "string", enum: ["", null], nullable: true },
        ],
      },
      ocupacion_cliente: {
        anyOf: [
          { type: "string", minLength: 1, maxLength: 200 },
          { type: "string", enum: ["", null], nullable: true },
        ],
      },
      curp_cliente: {
        type: "string",
        pattern: REGEX_CURP,
      },
      tipo_calle_cliente: {
        type: "object",
        properties: {
          name: { type: "string" },
          value: {
            type: "string",
            enum: Object.values(TipoCalles),
          },
        },
      },
      nombre_calle_cliente: { type: "string" },
      numero_exterior_cliente: { type: "string" },
      numero_interior_cliente: { type: "string" },
      colonia_cliente: { type: "string" },
      municipio_cliente: { type: "string" },
      estado_cliente: {
        type: "object",
        properties: {
          name: { type: "string" },
          value: {
            type: "string",
            enum: Object.values(States),
          },
        },
      },
      cp_cliente: { type: "string", pattern: REGEX_ZIP_CODE },
      referencias_dom_cliente: {
        anyOf: [
          { type: "string" },
          { type: "string", enum: ["", null], nullable: true },
        ],
      },
      id_domicilio_cliente: {
        anyOf: [
          { type: "integer", minimum: 1, maximum: 2147483647 },
          { type: "integer", enum: ["", null], nullable: true },
        ],
      },

      cruce_calles_cliente: {
        anyOf: [
          { type: "string" },
          { type: "string", enum: ["", null], nullable: true },
        ],
      },

      gmaps_url_location: {
        anyOf: [
          { type: "string", format: "uri" },
          { type: "string", enum: ["", null], nullable: true },
        ],
      },

      isCustomerAddressUpdate: { type: "boolean" },
    },
    required: [
      "nombre_cliente",
      "apellido_paterno_cliente",
      "apellido_materno_cliente",
      "telefono_movil_cliente",
      "curp_cliente",
      "tipo_calle_cliente",
      "nombre_calle_cliente",
      "numero_exterior_cliente",
      "colonia_cliente",
      "municipio_cliente",
      "estado_cliente",
      "cp_cliente",
      "isCustomerAddressUpdate",
    ],
    additionalProperties: false,

    //
    if: {
      properties: {
        isCustomerAddressUpdate: { const: true },
      },
      required: ["isCustomerAddressUpdate"],
    },
    then: {
      required: ["id_domicilio_cliente"],
      properties: {
        id_domicilio_cliente: {
          type: "integer",
          minimum: 1,
          maximum: 2147483647,
          nullable: false,
        },
      },
    },
    //
  },

  formAval: {
    type: "object",
    properties: {
      id_aval: {
        anyOf: [
          { type: "integer" },
          { type: "integer", enum: ["", null], nullable: true },
        ],
      },
      nombre_aval: { type: "string" },
      apellido_materno_aval: { type: "string" },
      apellido_paterno_aval: { type: "string" },

      ocupacion_aval: {
        anyOf: [
          { type: "string", minLength: 1, maxLength: 200 },
          { type: "string", enum: ["", null], nullable: true },
        ],
      },

      telefono_fijo_aval: {
        anyOf: [
          {
            type: "string",
            pattern: REGEX_PHONE,
          },
          { type: "string", enum: ["", null], nullable: true },
        ],
      },
      telefono_movil_aval: {
        anyOf: [
          {
            type: "string",
            pattern: REGEX_PHONE,
          },
          { type: "string", enum: ["", null], nullable: true },
        ],
      },
      correo_electronico_aval: {
        anyOf: [
          {
            type: "string",
            pattern: REGEX_EMAIL,
          },
          { type: "string", enum: ["", null], nullable: true },
        ],
      },
      curp_aval: {
        type: "string",
        pattern: REGEX_CURP,
      },

      tipo_calle_aval: {
        type: "object",
        properties: {
          name: { type: "string" },
          value: {
            type: "string",
            enum: Object.values(TipoCalles),
          },
        },
      },
      nombre_calle_aval: { type: "string" },
      numero_exterior_aval: { type: "string" },
      numero_interior_aval: { type: "string" },
      colonia_aval: { type: "string" },
      municipio_aval: { type: "string" },
      estado_aval: {
        type: "object",
        properties: {
          name: { type: "string" },
          value: {
            type: "string",
            enum: Object.values(States),
          },
        },
      },
      cp_aval: { type: "string", pattern: REGEX_ZIP_CODE },
      referencias_dom_aval: {
        anyOf: [
          { type: "string" },
          { type: "string", enum: ["", null], nullable: true },
        ],
      },
      id_domicilio_aval: {
        anyOf: [
          { type: "integer", minimum: 1, maximum: 2147483647 },
          { type: "integer", enum: ["", null], nullable: true },
        ],
      },

      cruce_calles_aval: {
        anyOf: [
          { type: "string" },
          { type: "string", enum: ["", null], nullable: true },
        ],
      },

      isGuarantorAddressUpdate: { type: "boolean" },

      additionalProperties: false,
    },
    required: [
      "nombre_aval",
      "apellido_paterno_aval",
      "apellido_materno_aval",
      "telefono_movil_aval",
      "curp_aval",
      "tipo_calle_aval",
      "nombre_calle_aval",
      "numero_exterior_aval",
      "colonia_aval",
      "municipio_aval",
      "estado_aval",
      "cp_aval",
      "isGuarantorAddressUpdate",
    ],
    additionalProperties: false,
    //
    if: {
      properties: {
        isGuarantorAddressUpdate: { const: true },
      },
      required: ["isGuarantorAddressUpdate"],
    },
    then: {
      required: ["id_domicilio_aval"],
      properties: {
        id_domicilio_aval: {
          type: "integer",
          minimum: 1,
          maximum: 2147483647,
          nullable: false,
        },
      },
    },
    //
  },

  created_by: { type: "integer" },
  modified_by: { type: "integer" },
  user_role: { type: "string" },
  status_code: { type: "integer" },
  id_loan_to_refinance: {
    anyOf: [
      { type: "integer" },
      { type: "integer", enum: ["", null], nullable: true },
    ],
  },
};

export const requiredFielsForUpdateLoanRequest = [
  "id",
  "request_number",
  "loan_request_status",
  "cantidad_prestada",
  "cantidad_pagar",
  "id_agente",
  "id_grupo_original",
  "plazo",
  "formCliente",
  "formAval",
  "modified_by",
  "user_role",
];

export const requiredFielsForNewLoanRequest = [
  "cantidad_prestada",
  "cantidad_pagar",
  "id_agente",
  "id_grupo_original",
  "plazo",
  "formCliente",
  "formAval",
  "created_by",
  "user_role",
];

export const validateStartDate = {
  if: {
    properties: {
      fecha_inicial: { type: "string", format: "date-time" },
    },
    required: ["fecha_inicial"],
  },
  then: {
    required: ["fecha_final_estimada"],
    properties: {
      fecha_final_estimada: { type: "string", format: "date-time" },
    },
  },
};
