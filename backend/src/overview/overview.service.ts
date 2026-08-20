import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OverviewService {
  constructor(private prisma: PrismaService) {}

  async getQuickStats() {
    // Only include shipped and placed orders for revenue calculation
    const orders = await this.prisma.order.findMany({
      where: {
        status: { in: ['Shipped', 'Accepted', 'Delivered'] }
      }
    });
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const totalOrders = orders.length;
    const totalUsers = await this.prisma.user.count();
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      totalUsers,
      avgOrderValue: Math.round(avgOrderValue)
    };
  }

  async getRecentActivity() {
    const recentOrders = await this.prisma.order.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true }
    });

    const recentUsers = await this.prisma.user.findMany({
      take: 1,
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });

    const recentProducts = await this.prisma.product.findMany({
      take: 1,
      orderBy: { updatedAt: 'desc' },
      select: { name: true, updatedAt: true }
    });

    const lowStockProducts = await this.prisma.product.findMany({
      take: 1,
      orderBy: { updatedAt: 'desc' },
      select: { name: true, updatedAt: true }
    });

    const activities: Array<{type: string; message: string; time: string}> = [];

    recentOrders.forEach(order => {
      activities.push({
        type: 'order',
        message: `New order #${order.id} received`,
        time: this.getTimeAgo(order.createdAt)
      });
    });

    if (recentUsers[0]) {
      activities.push({
        type: 'customer',
        message: 'New customer registration',
        time: this.getTimeAgo(recentUsers[0].createdAt)
      });
    }

    if (recentProducts[0]) {
      activities.push({
        type: 'product',
        message: `Product "${recentProducts[0].name}" updated`,
        time: this.getTimeAgo(recentProducts[0].updatedAt)
      });
    }

    if (lowStockProducts[0]) {
      activities.push({
        type: 'stock',
        message: `Low stock alert for "${lowStockProducts[0].name}"`,
        time: this.getTimeAgo(lowStockProducts[0].updatedAt)
      });
    }

    return activities.slice(0, 5);
  }

  async getTopPerformers() {
    // Only include order items from shipped and placed orders
    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['productId', 'name', 'imageUrl'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 4,
      where: { 
        productId: { not: null },
        order: {
          status: { in: ['Shipped', 'Placed'] }
        }
      }
    });

    return topProducts.map(p => ({
      name: p.name,
      image: p.imageUrl,
      metric: `${p._sum.quantity} sales`,
      status: (p._sum.quantity || 0) > 200 ? 'trending' : (p._sum.quantity || 0) > 150 ? 'stable' : 'declining'
    }));
  }

  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  }
}
