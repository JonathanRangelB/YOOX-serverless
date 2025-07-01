import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

import { transformSQSRecordAttributes } from './utils/transformMessageAttributes';
import { processSimpleTextMessage } from './simpleTextHandler';
import { processTemplateMessage } from './templateHandler';
import {
  DirectTextMessage,
  TemplateMessage,
} from './interfaces/whatsappMessage';

export interface MessageBody {
  messageType?: string;
  body?: string;
  to?: string;
}

export const handler = async (event: any) => {
  for (const record of event.Records) {
    try {
      console.log(typeof event);
      console.log({ record });
      let message;
      try {
        message = JSON.parse(record.body) as MessageBody;
      } catch (_) {
        message = record as MessageBody;
      }

      switch (message.messageType) {
        case 'text':
          await processSimpleTextMessage(message as DirectTextMessage);
          break;

        case 'template':
          await processTemplateMessage(message as TemplateMessage);
          break;

        default:
          throw new Error('Tipo de mensaje desconocido recibido');
      }
    } catch (error) {
      const retryCount = record.attributes?.ApproximateReceiveCount
        ? parseInt(record.attributes.ApproximateReceiveCount, 10)
        : 1;

      if (retryCount >= 3) {
        const client = new SQSClient({
          region: process.env.MY_AWS_REGION,
          credentials: {
            accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY!,
          },
        });
        const deadLetterQueueUrl = process.env.DLQ_SQS_URL;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (deadLetterQueueUrl) {
          const command = new SendMessageCommand({
            QueueUrl: deadLetterQueueUrl,
            MessageBody: record.body,
            MessageAttributes: transformSQSRecordAttributes(
              record.attributes,
              errorMessage
            ),
          });
          const response = await client.send(command);
          console.error({
            message:
              'Error procesando el registro SQS, enviado a dead-letter queue',
            originalMessageId: record.messageId,
            dlqMessageId: response.MessageId,
          });
        } else {
          console.error(
            'No se encontró la URL de la dead-letter queue.',
            record.messageId
          );
        }
      } else {
        console.error(
          'Error procesando el registro SQS, reintentando:',
          record.messageId,
          `Intento: ${retryCount}`
        );
        throw error;
      }
    }
  }
};
