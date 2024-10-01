import { APIGatewayEvent } from "aws-lambda";
import { S3 } from "aws-sdk";

import { generateJsonResponse } from "../helpers/generateJsonResponse";

const s3 = new S3();

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body)
    return generateJsonResponse({ message: "No body provided" }, 400);

  const bucketName = process.env.BUCKET_NAME || "documentos-clientes-yoox";
  const { filenames } = JSON.parse(event.body) as { filenames: string[] };

  if (filenames.length > 10)
    return generateJsonResponse(
      { message: "Solo se permite un maximo de 10 archivos" },
      400,
    );

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

    return generateJsonResponse({ uploadUrls }, 200);
  } catch (error) {
    if (error instanceof Error)
      return generateJsonResponse(
        { message: "Error generating signed URL", error: error.message },
        500,
      );
  }
};
