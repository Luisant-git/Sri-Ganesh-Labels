import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { UploadModule } from './upload/upload.module';
import { BrandModule } from './brand/brand.module';
import { CategoryModule } from './category/category.module';
import { SubCategoryModule } from './subcategory/subcategory.module';
import { BannerModule } from './banner/banner.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CouponModule } from './coupon/coupon.module';
import { CustomerModule } from './customer/customer.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { WhatsappSessionModule } from './whatsapp-session/whatsapp-session.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { OverviewModule } from './overview/overview.module';
import { PincodeModule } from './pincode.module';
import { ShippingModule } from './shipping.module';
import { SettingsModule } from './settings/settings.module';
import { SizeChartModule } from './size-chart/size-chart.module';
import { ShiprocketModule } from './shiprocket/shiprocket.module';
import { EmailModule } from './email/email.module';
import { CourierPartnerModule } from './courier-partner/courier-partner.module';

@Module({
  imports: [ScheduleModule.forRoot(), UserModule, AuthModule, ProductModule, UploadModule, BrandModule, CategoryModule, SubCategoryModule, BannerModule, CartModule, OrderModule, WishlistModule, CouponModule, CustomerModule, WhatsappModule, WhatsappSessionModule, DashboardModule, OverviewModule, PincodeModule, ShippingModule, SettingsModule, SizeChartModule, ShiprocketModule, EmailModule, CourierPartnerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
