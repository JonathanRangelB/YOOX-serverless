export interface ValidateLoanResponse {
  valid: boolean;
  error?: string;
  additionalProperties?: AdditionalProperties[];
}

export interface AdditionalProperties {
  propiedad: string;
  path: string;
}
