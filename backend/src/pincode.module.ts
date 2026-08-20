import { Module } from '@nestjs/common';
import { PincodeService } from './pincode.service';
import { PincodeController } from './pincode.controller';
import { PrismaService } from './prisma.service';

@Module({
  controllers: [PincodeController],
  providers: [PincodeService, PrismaService],
})
export class PincodeModule {}
