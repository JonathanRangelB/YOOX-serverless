import { APIGatewayEvent } from "aws-lambda";
import { S3 } from "aws-sdk";
import Ajv from "ajv";

import { generateJsonResponse } from "../helpers/generateJsonResponse";
import { StatusCodes } from "../helpers/statusCodes";
import { FileDataSchema } from "./schemas/file.schema";
import { fileData } from "./types/fileData";

const s3 = new S3();
const ajv = new Ajv({ allErrors: true });

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body)
    return generateJsonResponse(
      { message: "No body provided" },
      StatusCodes.BAD_REQUEST,
    );

  const data: fileData = JSON.parse(event.body);
  const validate = ajv.compile(FileDataSchema);
  const valid = validate(data);
  const error = ajv.errorsText(validate.errors, { separator: " AND " });

  if (!valid) return generateJsonResponse({ error }, StatusCodes.BAD_REQUEST);

  const { filename, path } = data;

  const bucketName = process.env.BUCKET_NAME || "documentos-clientes-yoox";
  const params = {
    Bucket: bucketName,
    Key: path + filename,
    Expires: 30, // La URL será válida por 30 segundos
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  };

  try {
    const signedUrl = await s3.getSignedUrlPromise("getObject", params);
    return generateJsonResponse({ signedUrl }, StatusCodes.OK);
  } catch (error) {
    console.log(error);
    if (error instanceof Error)
      return generateJsonResponse(
        { error: error.message },
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
  }
};
