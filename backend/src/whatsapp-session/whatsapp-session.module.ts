import { Module } from '@nestjs/common';
import { WhatsappSessionController } from './whatsapp-session.controller';
import { WhatsappSessionService } from './whatsapp-session.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [WhatsappSessionController],
  providers: [WhatsappSessionService, PrismaService],
  exports: [WhatsappSessionService]
})
export class WhatsappSessionModule {}
