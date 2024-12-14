import { APIGatewayEvent } from 'aws-lambda';
import {
  S3Client,
  GetObjectCommand,
  GetObjectRequest,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Ajv from 'ajv';

import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { StatusCodes } from '../helpers/statusCodes';
import { FileDataSchema } from './schemas/file.schema';
import { fileData } from './types/fileData';

const client = new S3Client();
const ajv = new Ajv({ allErrors: true });

module.exports.handler = async (event: APIGatewayEvent) => {
  if (!event.body)
    return generateJsonResponse(
      { message: 'No body provided' },
      StatusCodes.BAD_REQUEST
    );

  const data: fileData = JSON.parse(event.body);
  const validate = ajv.compile(FileDataSchema);
  const valid = validate(data);
  const error = ajv.errorsText(validate.errors, { separator: ' AND ' });

  if (!valid) return generateJsonResponse({ error }, StatusCodes.BAD_REQUEST);

  const { filename, path } = data;

  const bucketName = process.env.BUCKET_NAME || 'documentos-clientes-yoox';
  const params: GetObjectRequest = {
    Bucket: bucketName,
    Key: path + filename,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  };

  try {
    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 60 });
    return generateJsonResponse(signedUrl, StatusCodes.OK);
  } catch (error) {
    console.log(error);
    if (error instanceof Error)
      return generateJsonResponse(
        { error: error.message },
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
};
