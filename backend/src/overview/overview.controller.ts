import { Controller, Get, UseGuards } from '@nestjs/common';
import { OverviewService } from './overview.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('overview')
@UseGuards(JwtAuthGuard)
export class OverviewController {
  constructor(private readonly overviewService: OverviewService) {}

  @Get('quick-stats')
  async getQuickStats() {
    return this.overviewService.getQuickStats();
  }

  @Get('recent-activity')
  async getRecentActivity() {
    return this.overviewService.getRecentActivity();
  }

  @Get('top-performers')
  async getTopPerformers() {
    return this.overviewService.getTopPerformers();
  }
}
