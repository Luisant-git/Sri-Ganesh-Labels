import { Module, Global } from '@nestjs/common';
import { ShiprocketService } from './shiprocket.service';
import { ShiprocketController } from './shiprocket.controller';
import { PrismaService } from '../prisma.service';
import { OrderModule } from '../order/order.module';

@Global()
@Module({
  imports: [OrderModule], // Import OrderModule to use OrderService
  providers: [ShiprocketService, PrismaService],
  controllers: [ShiprocketController],
  exports: [ShiprocketService],
})
export class ShiprocketModule {}
