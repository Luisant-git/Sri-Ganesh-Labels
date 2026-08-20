import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { WhatsappSessionService } from './whatsapp-session.service';

@Controller('whatsapp-session')
export class WhatsappSessionController {
  constructor(private readonly sessionService: WhatsappSessionService) {}

  @Post('test-menu')
  async testMenu(@Body() body: { phone: string; message: string }) {
    const mockSendMessage = async (to: string, msg: string) => {
      console.log(`\n📱 Message to ${to}:\n${msg}\n`);
      return { success: true };
    };
    await this.sessionService.handleInteractiveMenu(body.phone, body.message, mockSendMessage);
    return { success: true, message: 'Check console for output' };
  }

  @Get('session')
  async getSession(@Query('phone') phone: string) {
    return this.sessionService.getSession(phone);
  }
}
