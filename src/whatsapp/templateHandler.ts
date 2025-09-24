import { TemplateMessage } from "./interfaces/whatsappMessage";

export const processTemplateMessage = async (message: TemplateMessage) => {
  console.log(`Enviando plantilla "${message.templateName}" a ${message.to}`);
};
