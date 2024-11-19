export interface validateLoanResponse {
  valid: boolean;
  error?: string;
  additionalProperties?: AdditionalProperties[];
}

export interface AdditionalProperties {
  propiedad: string;
  path: string;
}
