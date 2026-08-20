import { Injectable } from '@nestjs/common';
import axios from 'axios';
 
@Injectable()
export class WhatsAppService {
  private readonly phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  private readonly token = process.env.WHATSAPP_ACCESS_TOKEN;
 
  async sendOtp(phone: string, otp: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'template',
          template: {
            name: 'otp_en3_auth',
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [{ type: 'text', text: otp }]
              },
              {
                type: 'button',
                sub_type: 'url',
                index: '0',
                parameters: [{ type: 'text', text: otp }]
              }
            ]
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('WhatsApp API Success:', response.data);
      return true;
    } catch (error) {
      console.error('WhatsApp API Error:', JSON.stringify(error.response?.data || error.message, null, 2));
      return false;
    }
  }
}