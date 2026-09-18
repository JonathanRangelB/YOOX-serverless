import {
  CallStatus,
  RevisionClassification,
  PlannerCurrentStatus
} from "../../helpers/utils";

export const updateOutstCollPlannerSchema = {
  type: "object",

  properties: {
    loan_request_id: { type: "integer", minimum: 1 },

    revised_record: {
      type: "number",
      enum: Object.values(RevisionClassification)
    },

    authorized_amount: { type: "number", minimum: 1000 },

    primary_borrower_call_status: {
      type: "string",
      enum: Object.values(CallStatus)
    },

    guarantor_call_status: {
      type: "string",
      enum: Object.values(CallStatus)
    },

    current_status: {
      type: "string",
      enum: Object.values(PlannerCurrentStatus)
    },

    observations: {
      anyOf: [
        { type: "string" },
        { type: "string", enum: ["", null], nullable: true },
      ],
    },

    modified_by: { type: "number" },

    remote_utc_local_datetime: { type: "string", format: "date-time" },

    management_id: { type: "number", minimum: 1 },
  },

  required: [
    "loan_request_id",
    "revised_record",
    "authorized_amount",
    "primary_borrower_call_status",
    "guarantor_call_status",
    "current_status",
    "modified_by",
    "remote_utc_local_datetime",
    "management_id"
  ],

  additionalProperties: false,

};
