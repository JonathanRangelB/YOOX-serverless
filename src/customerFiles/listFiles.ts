import { APIGatewayEvent } from "aws-lambda";
import { S3 } from "aws-sdk";

import { generateJsonResponse } from "../helpers/generateJsonResponse";
import { StatusCodes } from "../helpers/statusCodes";

const s3 = new S3();

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.pathParameters)
    return generateJsonResponse(
      { message: "No pathParameters provided" },
      StatusCodes.BAD_REQUEST,
    );

  const { foldername } = event.pathParameters;

  if (!foldername)
    return generateJsonResponse(
      { message: "No foldername provided" },
      StatusCodes.BAD_REQUEST,
    );

  const bucketName = process.env.BUCKET_NAME || "documentos-clientes-yoox";
  const params = {
    Bucket: bucketName,
    Prefix: foldername,
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    const files = data.Contents?.map((item) => item.Key) || [];

    return generateJsonResponse({ files }, StatusCodes.OK);
  } catch (error) {
    console.error(error);
    if (error instanceof Error)
      return generateJsonResponse(
        { error: error.message },
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
  }
};
