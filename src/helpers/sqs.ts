import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import {
  DEV_QUEUE,
  WhatsAppMessage,
} from '../whatsapp/interfaces/whatsappMessage';

export async function enqueueWhatsappMessage(wa_message: WhatsAppMessage) {
  let commandBody;
  const countryCode = wa_message.countryCode || '52'; // Por defecto es el codigo de Mexico si es que no se proporciona

  if (wa_message.messageType === 'text') {
    commandBody = {
      QueueUrl: process.env.MAIN_SQS_URL || DEV_QUEUE,
      MessageBody: JSON.stringify({
        messageType: wa_message.messageType,
        to: `${countryCode}1${wa_message.to}`, // NOTE: se agrega el numero 1 entre el codigo de pais y el numero de telefono, solo asi funciona, es cosa de whatsapp
        body: wa_message.body,
      }),
    };
  } else {
    // Cambiar por un else if cuando exista otro tipo de mensaje ademas de "template"
    commandBody = {
      QueueUrl: process.env.MAIN_SQS_URL || DEV_QUEUE,
      MessageBody: JSON.stringify({
        messageType: wa_message.messageType,
        to: `${countryCode}1${wa_message.to}`,
        body: 'Template no implementado, si estas leyendo esto notificalo.',
      }),
    };
  }

  const sqsClientConfiguration = {
    region: process.env.MY_AWS_REGION,
    credentials: {
      accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY!,
    },
    // ...(process.env.NODE_ENV === 'development' ? { endpoint: DEV_QUEUE } : {}),
  };

  const command = new SendMessageCommand(commandBody);
  const client = new SQSClient(sqsClientConfiguration);

  await client.send(command);
}
