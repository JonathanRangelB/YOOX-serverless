export interface CollectionsPlannerPatchRequest {
  loan_request_id: number,
  revised_record: number,
  authorized_amount: number,
  primary_borrower_call_status: string,
  guarantor_call_status: string,
  current_status: string,
  observations?: string,
  modified_by: number,
  remote_utc_local_datetime?: Date
}

export interface CollectionsPlannerPostRequest {
  id_user: number,
  remote_utc_local_datetime: Date
}
