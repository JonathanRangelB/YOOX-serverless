import { DbConnector } from "../../helpers/dbConnector";
import { CollectionsPlanner } from "../types/SPGetCollectionsPlanner.interface";
import sql from "mssql";

export async function getCollectionsList(loanRequestId?: number): Promise<CollectionsPlanner[]> {
  const filterCondition = ` where                            
                            p.close_utc_datetime_stamp is null or 
                            (p.close_utc_datetime_stamp between DATEADD(hour, -28, GETUTCDATE() ) and GETUTCDATE())`

  const whereString = loanRequestId ? " where p.loan_request_id=@loanRequestId " : filterCondition;

  const queryString = ` select
                        p.loan_request_id,
                        p.insert_utc_datetime_stamp,
                        p.loan_request_utc_date,
                        p.last_change_loan_request_utc_date,
                        p.collection_id_agent,
                        u.nombre as collection_name_agent,
                        p.loan_request_number,
                        p.customer_id,
                        p.customer_name,
                        p.credit_type,
                        cast(p.revised_record as int) as [revised_record],
                        p.requested_amount,
                        p.authorized_amount,
                        p.discount_amount,
                        p.customer_neighborhood,
                        p.customer_county,
                        p.primary_borrower_call_status,
                        p.guarantor_call_status,
                        p.current_status,
                        p.observations,
                        cast(p.captured_account as int) as [captured_account],
                        p.budget,
                        p.real_inversion,
                        p.last_change_utc_date,
                        p.modified_by,
                        p.accounting_date,
                        p.group_id,
                        gp.nombre as group_name,
                        p.management_id,
                        gr.nombre as management_name,
                        p.close_utc_datetime_stamp

                      from
                      outstanding_collections_planner p
                      left join grupos_agentes gp on p.group_id=gp.id_grupo
                      left join gerencias_grupos gr on p.management_id=gr.id_gerencia
          					  left join usuarios u on p.collection_id_agent=u.id

                      ${whereString}
                      `;

  const pool = await DbConnector.getInstance().connection;
  const poolRequest = pool.request();

  if (loanRequestId) {
    poolRequest.input("loanRequestId", sql.Int, loanRequestId);
  }

  const queryResult = await poolRequest.query(queryString);

  return queryResult.recordset;

}
