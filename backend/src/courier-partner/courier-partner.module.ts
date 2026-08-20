import { Module } from '@nestjs/common';
import { CourierPartnerService } from './courier-partner.service';
import { CourierPartnerController } from './courier-partner.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [CourierPartnerController],
  providers: [CourierPartnerService, PrismaService],
})
export class CourierPartnerModule {}
