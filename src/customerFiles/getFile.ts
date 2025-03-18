import { APIGatewayEvent } from 'aws-lambda';
import {
  S3Client,
  GetObjectCommand,
  GetObjectRequest,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { StatusCodes } from '../helpers/statusCodes';
import { FileDataSchema } from './schemas/file.schema';
import { fileData } from './types/fileData';
import { validatePayload } from '../helpers/utils';

const client = new S3Client({
  region: process.env.MY_AWS_REGION,
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY!,
  },
});

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body)
    return generateJsonResponse(
      { message: 'No body provided' },
      StatusCodes.BAD_REQUEST
    );

  const data: fileData = JSON.parse(event.body);
  const validData = validatePayload(data, FileDataSchema);

  if (!validData.valid)
    return generateJsonResponse(
      {
        message: 'Object provided invalid',
        error: validData.error,
        additionalProperties: validData.additionalProperties,
      },
      StatusCodes.BAD_REQUEST
    );

  const { filename, path } = data;

  const bucketName = process.env.BUCKET_NAME || 'documentos-clientes-yoox';
  const upperCasePath = path.toUpperCase();
  const params: GetObjectRequest = {
    Bucket: bucketName,
    Key: upperCasePath + filename,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  };

  try {
    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 60 });
    return generateJsonResponse(signedUrl, StatusCodes.OK);
  } catch (error) {
    if (error instanceof Error)
      return generateJsonResponse(
        { error: error.message },
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
};
