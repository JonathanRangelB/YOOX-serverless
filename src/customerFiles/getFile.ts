import { APIGatewayEvent } from "aws-lambda";
import { S3 } from "aws-sdk";

import { generateJsonResponse } from "../helpers/generateJsonResponse";
import { StatusCodes } from "../helpers/statusCodes";

const s3 = new S3();

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body)
    return generateJsonResponse(
      { message: "No body provided" },
      StatusCodes.BAD_REQUEST,
    );

  const { filename } = JSON.parse(event.body) as { filename: string };
  const { path } = JSON.parse(event.body) as { path: string };

  if (!filename)
    return generateJsonResponse(
      { message: "No filepath provided" },
      StatusCodes.BAD_REQUEST,
    );

  if (!path)
    return generateJsonResponse(
      { message: "No path provided" },
      StatusCodes.BAD_REQUEST,
    );

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
