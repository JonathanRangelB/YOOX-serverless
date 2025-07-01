import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import {
  CommandBody,
  DEV_QUEUE,
  WhatsAppMessage,
} from '../whatsapp/interfaces/whatsappMessage';
import { getPhoneNumberByPersonId } from './asyncUtils';

const sqsClientConfiguration = {
  region: process.env.MY_AWS_REGION,
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY!,
  },
};

export async function enqueueWhatsappMessage(wa_message: WhatsAppMessage) {
  let commandBody: CommandBody;
  // seccion mensajes tipo "text"
  if (wa_message.messageType === 'text') {
    if ('to' in wa_message) {
      // si tiene el "to" se manda directo
      commandBody = buildSimpleTextMessageCommandBody(
        wa_message.messageType,
        wa_message.body,
        wa_message.to
      );
    } else {
      // en caso de que no tenga el "to" se busca el telefono por el id de la persona
      const phoneNumber = await getPhoneNumberByPersonId(
        wa_message.table,
        wa_message.id_person
      );
      if (!phoneNumber) {
        throw new Error('no se encontro el telefono de la persona');
      }
      commandBody = buildSimpleTextMessageCommandBody(
        wa_message.messageType,
        wa_message.body,
        phoneNumber
      );
    }
  } else {
    // seccion mensajes tipo "template" (aun no implementada)
    commandBody = buildTemplateTextMessageCommandBody(
      wa_message.messageType,
      'no implementado',
      wa_message.to,
      wa_message.languageCode,
      wa_message.templateName,
      wa_message.components
    );
  }
  const command = new SendMessageCommand(commandBody);
  const client = new SQSClient(sqsClientConfiguration);
  const result = await client.send(command);
  console.log({ command, client, result });
}

function buildSimpleTextMessageCommandBody(
  messageType: string,
  body: string,
  phoneNumber: string,
  countryCode = '52'
) {
  return {
    QueueUrl: process.env.MAIN_SQS_URL || DEV_QUEUE,
    MessageBody: JSON.stringify({
      messageType: messageType,
      body: body,
      to: process.env.TEST_PHONE || `${countryCode}1${phoneNumber}`,
    }),
  };
}

function buildTemplateTextMessageCommandBody(
  messageType: string,
  body: string,
  phoneNumber: string,
  languageCode: string,
  templateName: string,
  components: any[],
  countryCode = '52'
) {
  return {
    QueueUrl: process.env.MAIN_SQS_URL || DEV_QUEUE,
    MessageBody: JSON.stringify({
      messageType: messageType,
      body: `${body}|${languageCode}|${templateName}|${components}`,
      to: process.env.TEST_PHONE || `${countryCode}1${phoneNumber}`,
    }),
  };
}
