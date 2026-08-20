import { Module } from '@nestjs/common';
import { OverviewController } from './overview.controller';
import { OverviewService } from './overview.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [OverviewController],
  providers: [OverviewService, PrismaService],
})
export class OverviewModule {}
