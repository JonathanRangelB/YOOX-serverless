import { SimpleTextMessage } from './interfaces/whatsappMessage';

export const processSimpleTextMessage = async (message: SimpleTextMessage) => {
  const result = await fetch(`${process.env.WA_BASE_URL}/api/sendText`, {
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
