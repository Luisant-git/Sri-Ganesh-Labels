import { Module } from '@nestjs/common'
import { ShippingController } from './shipping.controller'
import { PrismaService } from './prisma.service'

@Module({
  controllers: [ShippingController],
  providers: [PrismaService]
})
export class ShippingModule {}