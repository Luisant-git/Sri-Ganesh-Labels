import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Query('year') year: string) {
    return this.dashboardService.getDashboardStats(year);
  }

  @Get('sales-analytics')
  async getSalesAnalytics(@Query('year') year: string) {
    return this.dashboardService.getSalesAnalytics(year);
  }

  @Get('sales-comparison')
  async getSalesComparison(@Query('type') type: string, @Query('year') year: string, @Query('month') month: string) {
    return this.dashboardService.getSalesComparison(type || 'yearly', year, month);
  }

  @Get('top-products')
  async getTopProducts() {
    return this.dashboardService.getTopSellingProducts();
  }

  @Get('offers')
  async getOffers() {
    return this.dashboardService.getCurrentOffers();
  }

  @Get('recent-orders')
  async getRecentOrders() {
    return this.dashboardService.getRecentOrders();
  }
}
