import { Module } from '@nestjs/common';
import { SizeChartService } from './size-chart.service';
import { SizeChartController } from './size-chart.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [SizeChartController],
  providers: [SizeChartService, PrismaService],
})
export class SizeChartModule {}
