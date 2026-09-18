import { InsertNewLoanRequest } from "../../loan-requests/types/SPInsertNewLoanRequest";
import { InsertOutstCollPlanner } from "../types/SPInsertOutstCollPlanner.interface";
import { Table } from "mssql";

export function buildOutstdCollObject(
  loanRequestTable: Table,
  loanRequestId: number
): InsertOutstCollPlanner | undefined {

  let outstdCollPlannerObj: InsertOutstCollPlanner;


  return undefined;
}
