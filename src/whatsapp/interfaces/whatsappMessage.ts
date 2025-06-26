export interface SimpleTextMessage {
  messageType: 'text';
  countryCode?: string;
  to: string;
  body: string;
}

export interface TemplateMessage {
  messageType: 'template';
  countryCode?: string;
  to: string;
  templateName: string;
  languageCode: 'es_MX' | 'en_US';
  components: any[]; // Puedes definir una estructura más estricta para los componentes
}

// Un tipo de unión que agrupa todos los posibles mensajes
export type WhatsAppMessage = SimpleTextMessage | TemplateMessage;

export const DEV_QUEUE = 'http://0.0.0.0:9324/queue/yoox-whatsapp-dev';

export interface CommandBody {
  QueueUrl: string;
  MessageBody: string;
}
