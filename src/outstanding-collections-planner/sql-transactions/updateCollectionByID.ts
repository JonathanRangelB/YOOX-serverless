import { registerUpdateOutstdCollection } from "./registerUpdateOutstdCollection";
import { DbConnector } from "../../helpers/dbConnector";
import { GenericBDRequest } from "../../general-data-requests/types/genericBDRequest";
import { StatusCodes } from "../../helpers/statusCodes";
import { CollectionsPlannerPatchRequest } from "../types/PayloadInterfacePlanner.interface";

export const updateCollectionByID = async (
  collectionBody: CollectionsPlannerPatchRequest
): Promise<GenericBDRequest> => {
  try {
    const pool = await DbConnector.getInstance().connection;
    const procTransaction = pool.transaction();
    await procTransaction.begin();

    const updateResult = await registerUpdateOutstdCollection(procTransaction, collectionBody);

    if (!updateResult.generatedId) {
      return updateResult;
    }

    await procTransaction.commit();

    return {
      generatedId: collectionBody.loan_request_id,
      message: `Registro actualizado`,
      error: StatusCodes.OK
    };

  } catch (exception) {
    return {
      generatedId: 0,
      message: (exception as Error).message,
      error: StatusCodes.BAD_REQUEST
    };
  }
}

