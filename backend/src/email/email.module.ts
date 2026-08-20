import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailControlService } from './email-control.service';
import { PrismaService } from '../prisma.service';

@Global()
@Module({
  providers: [EmailService, EmailControlService, PrismaService],
  exports: [EmailService, EmailControlService],
})
export class EmailModule {}
