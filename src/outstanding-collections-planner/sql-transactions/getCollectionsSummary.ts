import { DbConnector } from "../../helpers/dbConnector";
import { CollectionsSummary } from "../types/CollectionsPlannerSummary.interface";

export async function getCollectionSummary(): Promise<CollectionsSummary[]> {
  const queryString = `with
                        prev_tab as (
                          select
                          accounting_date
                          , captured_account 
                          , isnull(real_inversion, 0.0) as [real_inversion]
                          , budget
                          from outstanding_collections_planner

                          where
                          	current_status not in ('CANCELADO')
                          )

                        select
                        sum(cast(captured_account as int)) [captured_accounts]	
                        ,sum(budget) as [total_budget]
                        ,sum(real_inversion) as [totalReal_investment] 
                        ,accounting_date

                        from
                          prev_tab
                          
                        group by
                          accounting_date

                          `;

  const pool = await DbConnector.getInstance().connection;
  const poolRequest = pool.request();
  const queryResult = await poolRequest.query(queryString);

  return queryResult.recordset;
}
