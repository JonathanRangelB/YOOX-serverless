import { APIGatewayEvent } from "aws-lambda";
import { S3 } from "aws-sdk";
import { generateJsonResponse } from "../helpers/generateJsonResponse";

const s3 = new S3();

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.pathParameters)
    return generateJsonResponse({ message: "No pathParameters provided" }, 400);

  const { foldername } = event.pathParameters;

  if (!foldername)
    return generateJsonResponse({ message: "No foldername provided" }, 400);

  const bucketName = process.env.BUCKET_NAME || "documentos-clientes-yoox";
  const params = {
    Bucket: bucketName,
    Prefix: foldername,
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    const files = data.Contents?.map((item) => item.Key) || [];

    return generateJsonResponse({ files }, 200);
  } catch (error) {
    console.error(error);
    if (error instanceof Error)
      return generateJsonResponse({ error: error.message }, 500);
  }
};
