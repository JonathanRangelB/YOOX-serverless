export interface UpdateOutstCollPlanner {
  loan_request_id: number;
  revised_record?: number;
  authorized_amount?: number;
  primary_borrower_call_status?: string;
  guarantor_call_status?: string;
  current_status?: string;
  observations?: string;
  modified_by?: number;
  management_id?: number;
  collection_id_agent?: number;
  customer_id?: number;
  customer_name?: string;
  requested_amount?: number;
  customer_neighborhood?: string;
  customer_county?: string;
  group_id?: number;
  remote_utc_local_datetime?: Date;
  last_change_loan_request_utc_date?: string;
}

