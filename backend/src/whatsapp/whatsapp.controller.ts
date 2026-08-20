import { Controller, Post, Get, Body, Query, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { WhatsappService } from './whatsapp.service';
 
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}
 
  @Get('webhook')
  verifyWebhook(@Query() query: any) {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];
 
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('Webhook verified');
      return parseInt(challenge);
    }
    return 'Forbidden';
  }
 
  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const message = change.value.messages?.[0];
            if (message) {
              await this.whatsappService.handleIncomingMessage(message);
            }
            const statuses = change.value.statuses;
            if (statuses) {
              for (const status of statuses) {
                await this.whatsappService.updateMessageStatus(status.id, status.status);
              }
            }
          }
        }
      }
      return 'EVENT_RECEIVED';
    }
    return 'Not Found';
  }
 
  @Get('messages')
  async getMessages(@Query('phone') phone?: string) {
    return this.whatsappService.getMessages(phone);
  }
 
  @Post('send-message')
  async sendMessage(@Body() body: { to: string; message: string }) {
    return this.whatsappService.sendMessage(body.to, body.message);
  }
 
  @Post('send-bulk')
  async sendBulk(@Body() body: { phoneNumbers?: string[]; contacts?: Array<{name: string; phone: string}>; templateName: string; parameters?: any[] }) {
    if (body.contacts) {
      return this.whatsappService.sendBulkTemplateMessageWithNames(body.contacts, body.templateName);
    }
    return this.whatsappService.sendBulkTemplateMessage(body.phoneNumbers || [], body.templateName, body.parameters);
  }
 
  @Post('send-media')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
      }
    })
  }))
  async sendMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { to: string; caption?: string }
  ) {
    const mediaUrl = `${process.env.UPLOAD_URL}/${file.filename}`;
    const mediaType = file.mimetype.startsWith('image') ? 'image' :
                      file.mimetype.startsWith('video') ? 'video' :
                      file.mimetype.startsWith('audio') ? 'audio' : 'document';
    return this.whatsappService.sendMediaMessage(body.to, mediaUrl, mediaType, body.caption);
  }
  @Get('message-status/:messageId')
  async getMessageStatus(@Query('messageId') messageId: string) {
    return this.whatsappService.getMessageStatus(messageId);
  }

  @Post('low-stock-alert')
  async sendLowStockAlert(@Body() body: { phoneNumber: string; productDetails: string }) {
    return this.whatsappService.sendLowStockAlert(body.phoneNumber, body.productDetails);
  }
}
