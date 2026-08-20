import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma.service';
import { CouponModule } from '../coupon/coupon.module';
import { PaymentService } from './payment.service';
import { OrderCleanupService } from './order-cleanup.service';

@Module({
  imports: [CouponModule],
  controllers: [OrderController],
  providers: [OrderService, PrismaService, PaymentService, OrderCleanupService],
  exports: [OrderService]
})
export class OrderModule {}