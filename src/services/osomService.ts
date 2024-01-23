import https from 'https';
import { getValue } from './config-services';

export async function sendWapMessage(phone: string, body: string): Promise<void> {

  const OSOM_ENDPOINT= await getValue("OSOM_ENDPOINT")

  if (!OSOM_ENDPOINT) throw new Error("whatsappEndpoint not found")

  // if (process.env.NODE_ENV === 'development') {
  //   console.log("sendWapMessage: ", body)
  //   return
  // }

  const headers = {
    'Content-Type': 'application/json',
  }
  const data = {
    phone,
    body,
  } 

  const attempts= 3
  for (let i = 0; i < attempts; i++) {
    try {
      // const response = await axios.post(osomEndpoint, data, {
      //   headers: headers,
      //   httpsAgent: new https.Agent({
      //     rejectUnauthorized: false,
      //   }),
      // });
      // use fetch instead of axios
      const response = await fetch(OSOM_ENDPOINT, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
      })
      console.log('Whatsapp Success:');
      return
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

