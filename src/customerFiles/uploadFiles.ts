import { APIGatewayEvent } from "aws-lambda";
import { S3 } from "aws-sdk";
import Ajv from "ajv";

import { generateJsonResponse } from "../helpers/generateJsonResponse";
import { StatusCodes } from "../helpers/statusCodes";
import { FileNamesSchema } from "./schemas/filenames.schema";

const s3 = new S3();
const ajv = new Ajv({ allErrors: true });

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body)
    return generateJsonResponse(
      { message: "No body provided" },
      StatusCodes.BAD_REQUEST,
    );

  const data = JSON.parse(event.body) as { filenames: string[] };
  const validate = ajv.compile(FileNamesSchema);
  const valid = validate(data);
  const errors = ajv.errorsText(validate.errors, { separator: " AND " });

  if (!valid) return generateJsonResponse({ errors }, StatusCodes.BAD_REQUEST);

  const { filenames } = data;

  const bucketName = process.env.BUCKET_NAME || "documentos-clientes-yoox";

  try {
    const uploadUrls = await Promise.all(
      filenames.map(async (filename: string) => {
        const params = {
          Bucket: bucketName,
          Key: filename, // Archivo que se subirá con su ruta completa. Ej: documentos/imagen/{filename}
          Expires: 30, // La URL será válida por 30 segundos
          ContentType: "application/octet-stream", // Tipo de contenido generico binario, osea cualquier tipo de archivo
        };
        const signedUrl = await s3.getSignedUrlPromise("putObject", params);
        return { filename, signedUrl };
      }),
    );

    return generateJsonResponse({ uploadUrls }, StatusCodes.OK);
  } catch (error) {
    if (error instanceof Error)
      return generateJsonResponse(
        { message: "Error generating signed URL", error: error.message },
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
  }
};
