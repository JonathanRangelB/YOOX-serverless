import { generateGetJsonResponse } from "../helpers/generateGetJsonResponse";
import { validatePayload } from "../helpers/utils";
import { CollectionsPlannerPatchRequestSchema, CollectionsPlannerPostRequestSchema } from "./schemas/updateOutstnCollPlanner.schema";
import { StatusCodes } from "../helpers/statusCodes";
import { updateCollectionByID } from "./sql-transactions/updateCollectionByID";
import { generateJsonResponse } from "../helpers/generateJsonResponse";
import { getCollectionsList } from "./sql-transactions/getCollectionPlanner";
import { CollectionsPlannerPatchRequest, CollectionsPlannerPostRequest } from "./types/PayloadInterfacePlanner.interface";
import { RolesDeUsuario } from "../helpers/utils";
import { validateUserRole } from "../secure-data-access/validateUserRole";
import { clearOldRecordsCollPlanner } from "./sql-transactions/clearOldRecordsOutstdPlannerTable";
import { getCollectionSummary } from "./sql-transactions/getCollectionsSummary";

export const handler = async (event: any) => {
  try {

    if (!event.body) {
      return generateGetJsonResponse(
        {
          error: "No body provided",
        },
        StatusCodes.BAD_REQUEST
      )
    }

    const method = event.requestContext.http.method;
    const userRoles = [RolesDeUsuario.ADMINISTRADOR as string, RolesDeUsuario.USUARIO_NORMAL as string];

    if (method === 'POST') {
      const body = JSON.parse(event.body) as CollectionsPlannerPostRequest;

      const validateSchemaCollections = validatePayload(body, CollectionsPlannerPostRequestSchema);

      if (!validateSchemaCollections.valid) {
        return generateGetJsonResponse(
          {
            message: "Object provided invalid",
            error: validateSchemaCollections.error,
          },
          StatusCodes.BAD_REQUEST
        )
      }

      const id_user = body.id_user;
      const userRoleResponse = await validateUserRole(id_user, userRoles);

      if (!userRoleResponse.generatedId) {
        return generateJsonResponse({ error: userRoleResponse.message }, StatusCodes.NOT_FOUND);
      }

      //Clear the collections planner table of old records
      await clearOldRecordsCollPlanner(id_user);

      const recordSetCollections = await getCollectionsList();

      if (!recordSetCollections || recordSetCollections.length <= 0) {
        return generateJsonResponse({ error: "No se encontraron registros" }, StatusCodes.NOT_FOUND);
      }

      const recordSetCollSummary = await getCollectionSummary();

      return generateJsonResponse({ recordSetCollections, recordSetCollSummary }, StatusCodes.OK);

    } else if (method === 'PATCH') {

      const body = JSON.parse(event.body) as CollectionsPlannerPatchRequest;
      const validateSchemaCollections = validatePayload(body, CollectionsPlannerPatchRequestSchema);

      if (!validateSchemaCollections.valid) {
        return generateGetJsonResponse(
          {
            message: "Object provided invalid",
            error: validateSchemaCollections.error,
          },
          StatusCodes.BAD_REQUEST
        )
      }

      const id_user = body.modified_by;
      const userRoleResponse = await validateUserRole(id_user, userRoles);

      if (!userRoleResponse.generatedId) {
        return generateJsonResponse({ error: userRoleResponse.message }, StatusCodes.NOT_FOUND);
      }

      const updateResult = await updateCollectionByID(body);
      const updatedId = updateResult.generatedId;

      if (!updatedId) {
        return generateJsonResponse({ error: updateResult.message }, StatusCodes.BAD_REQUEST);
      }

      const recordSet = await getCollectionsList(updatedId);

      if (!recordSet || recordSet.length <= 0) {
        return generateJsonResponse({ error: "El registro no existe" }, StatusCodes.NOT_FOUND);
      }

      return generateJsonResponse(recordSet[0], StatusCodes.OK);

    } else {
      return generateJsonResponse({ error: "Invalid method" }, StatusCodes.METHOD_NOT_ALLOWED);
    }
  } catch (error) {
    return generateJsonResponse({ error }, StatusCodes.BAD_REQUEST)
  }
};
