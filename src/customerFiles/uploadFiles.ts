import { APIGatewayEvent } from 'aws-lambda';
import {
  S3Client,
  PutObjectCommand,
  PutObjectRequest,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { generateJsonResponse } from '../helpers/generateJsonResponse';
import { StatusCodes } from '../helpers/statusCodes';
import { FileNamesSchema } from './schemas/filenames.schema';
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

  const data = JSON.parse(event.body) as { filenames: string[] };

  const validData = validatePayload(data, FileNamesSchema);

  if (!validData.valid)
    return generateJsonResponse(
      {
        message: 'Object provided invalid',
        error: validData.error,
        additionalProperties: validData.additionalProperties,
      },
      StatusCodes.BAD_REQUEST
    );

  const { filenames } = data;

  const bucketName = process.env.BUCKET_NAME || 'documentos-clientes-yoox';

  try {
    const uploadUrls = await Promise.all(
      filenames.map(async (fullFileName: string) => {
        const [path, filename] = fullFileName.split('/');
        const params: PutObjectRequest = {
          Bucket: bucketName,
          Key: `${path.toUpperCase()}/${filename}`, // Archivo que se subirá con su ruta completa. Ej: documentos/imagen/{filename}
          ContentType: 'application/octet-stream', // Tipo de contenido generico binario, osea cualquier tipo de archivo
        };
        const command = new PutObjectCommand(params);
        const signedUrl = await getSignedUrl(client, command, {
          expiresIn: 30,
        });
        return { filename: fullFileName, signedUrl };
      })
    );

    return generateJsonResponse({ uploadUrls }, StatusCodes.OK);
  } catch (error) {
    if (error instanceof Error)
      return generateJsonResponse(
        { message: 'Error generating signed URL', error: error.message },
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
};
