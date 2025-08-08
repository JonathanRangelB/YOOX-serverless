import { registerWAErrorInDB } from '../helpers/asyncUtils';
import { DirectTextMessage } from './interfaces/whatsappMessage';

export const processSimpleTextMessage = async (message: DirectTextMessage) => {
  console.log('Processing simple text message:', message);
  const baseUrl = process.env.WHATSAPP_BASE_URL || 'http://localhost:3001';
  console.log('Base URL:', baseUrl);
  try {
    const result = await fetch(`${baseUrl}/api/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.WHATSAPP_API_KEY || '',
      },
      body: JSON.stringify({
        chatId: `${message.to}@c.us`,
        text: message.body,
        session: 'default',
      }),
    });
    console.log(result);

  } catch (error) {
    // Manejar el error, por ejemplo, loguearlo
    console.error('Error enviando mensaje de texto:', error);
  }
};
