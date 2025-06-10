export interface SimpleTextMessage {
  messageType: 'text';
  to: string;
  body: string;
}

export interface TemplateMessage {
  messageType: 'template';
  to: string;
  templateName: string;
  languageCode: 'es_MX' | 'en_US';
  components: any[]; // Puedes definir una estructura más estricta para los componentes
}

// Un tipo de unión que agrupa todos los posibles mensajes
export type WhatsAppMessage = SimpleTextMessage | TemplateMessage;
