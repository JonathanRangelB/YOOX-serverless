export interface InsertOutstCollPlanner {
  loan_request_id: number;
  insert_utc_datetime_stamp: Date;
  loan_request_utc_date: Date;
  collection_id_agent: number;
  loan_request_number: string;
  customer_id: number;
  customer_name: string;
  credit_type: string;
  requested_amount: number;
  authorized_amount: number;
  discount_amount: number;
  customer_neighborhood: string;
  customer_county: string;
  budget: number;
  group_id: number;
  management_id: number;
}
