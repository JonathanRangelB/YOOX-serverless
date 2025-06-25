import { SQSEvent } from 'aws-lambda';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import {
  SimpleTextMessage,
  TemplateMessage,
  WhatsAppMessage,
} from './interfaces/whatsappMessage';
import { transformSQSRecordAttributes } from './utils/transformMessageAttributes';

const processSimpleTextMessage = async (message: SimpleTextMessage) => {
  const result = await fetch('http://localhost:3001/api/sendText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chatId: `${message.to}@c.us`,
      text: message.body,
      session: 'default',
    }),
  });
  if (!result) {
    // TODO: guardar el error en la base de datos, puede deberse a que la sesion "default" no existe o que no este "corriendo"
    // si se da el segundo caso seria ejecutar un POST a http://localhost:3001/api/sessions/default/start (o a la URL que corresponda) para iniciar la sesion "default"
    // si no existe la sesion "default" se debe crear con una peticion POST a '/api/sessions' (las instruciones estan en https://github.com/devlikeapro/waha?tab=readme-ov-file)
    // despues ya solo solicitas el QR con una peticion GET a '/api/:session/auth/qr?format=image'
  }
  console.log(result);
};

// Función para procesar un mensaje de plantilla
const processTemplateMessage = (message: TemplateMessage) => {
  console.log(`Enviando plantilla "${message.templateName}" a ${message.to}`);
};

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      const messageBody = record.body;
      const message = JSON.parse(messageBody) as WhatsAppMessage;

      switch (message.messageType) {
        case 'text':
          processSimpleTextMessage(message);
          break;

        case 'template':
          processTemplateMessage(message);
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
