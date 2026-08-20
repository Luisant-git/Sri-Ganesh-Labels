import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(year?: string) {
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const isCurrentYear = targetYear === new Date().getFullYear();
    
    let thirtyDaysAgo = new Date();
    let sixtyDaysAgo = new Date();
    
    if (!isCurrentYear) {
      thirtyDaysAgo = new Date(targetYear, 11, 1); // Dec 1st of target year
      sixtyDaysAgo = new Date(targetYear, 10, 1);  // Nov 1st of target year
    } else {
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    }

    // Current period stats - only shipped and placed orders
    const currentOrders = await this.prisma.order.findMany({
      where: { 
        createdAt: { gte: thirtyDaysAgo },
        status: { in: ['Shipped', 'Accepted','Delivered'] }
      }
    });

    // Previous period stats for comparison - only shipped and placed orders
    const previousOrders = await this.prisma.order.findMany({
      where: { 
        createdAt: { 
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo 
        },
        status: { in: ['Shipped', 'Accepted','Delivered'] }
      }
    });

    const currentRevenue = currentOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(0) : '0';

    const currentOrderCount = currentOrders.length;
    const previousOrderCount = previousOrders.length;
    const orderChange = previousOrderCount > 0 ? ((currentOrderCount - previousOrderCount) / previousOrderCount * 100).toFixed(0) : '0';

    const currentCustomers = await this.prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    });
    const previousCustomers = await this.prisma.user.count({
      where: { 
        createdAt: { 
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo 
        } 
      }
    });
    const customerChange = previousCustomers > 0 ? ((currentCustomers - previousCustomers) / previousCustomers * 100).toFixed(0) : '0';

    const pendingDelivery = await this.prisma.order.count({
      where: { status: { in: ['pending', 'processing'] } }
    });

    return {
      totalRevenue: {
        value: `₹${currentRevenue.toFixed(0)}`,
        change: `${Math.abs(parseInt(revenueChange))}%`,
        trend: parseInt(revenueChange) >= 0 ? 'up' : 'down'
      },
      totalOrder: {
        value: currentOrderCount.toString(),
        change: `${Math.abs(parseInt(orderChange))}%`,
        trend: parseInt(orderChange) >= 0 ? 'up' : 'down'
      },
      totalCustomer: {
        value: currentCustomers.toString(),
        change: `${Math.abs(parseInt(customerChange))}%`,
        trend: parseInt(customerChange) >= 0 ? 'up' : 'down'
      },
      pendingDelivery: {
        value: pendingDelivery.toString(),
        change: '5%',
        trend: 'up'
      }
    };
  }

  async getSalesAnalytics(year?: string) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    const salesData = await Promise.all(
      months.map(async (month, index) => {
        const startDate = new Date(currentYear, index, 1);
        const endDate = new Date(currentYear, index + 1, 0);
        
        const orders = await this.prisma.order.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            },
            status: { in: ['Shipped', 'Placed'] }
          }
        });
        
        const sales = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
        return { month, sales: Math.round(sales) };
      })
    );

    return salesData;
  }

  async getSalesComparison(type: string, year?: string, monthParam?: string) {
    const now = new Date();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    
    let startDate: Date;
    let endDate = new Date();
    
    if (type === 'yearly') {
      startDate = new Date(targetYear, 0, 1);
      endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
    } else if (type === 'monthly') {
      const monthIndex = monthParam ? parseInt(monthParam) : (targetYear === now.getFullYear() ? now.getMonth() : 11);
      startDate = new Date(targetYear, monthIndex, 1);
      endDate = new Date(targetYear, monthIndex + 1, 0, 23, 59, 59, 999);
    } else if (type === 'weekly') {
      if (targetYear === now.getFullYear()) {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(now.setDate(diff));
        startDate.setHours(0,0,0,0);
        endDate = new Date(startDate.getTime());
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23,59,59,999);
      } else {
        // Last week of the target year
        startDate = new Date(targetYear, 11, 25);
        endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
      }
    } else {
      startDate = new Date(targetYear, 0, 1);
      endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
    }

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      include: { items: true }
    });

    const result = new Map<string, any>();

    const getGroupKey = (date: Date) => {
      if (type === 'yearly') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[date.getMonth()];
      } else if (type === 'monthly') {
        const d = date.getDate();
        const monthShort = date.toLocaleString('default', { month: 'short' });
        return `${d} ${monthShort}`;
      } else if (type === 'weekly') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
      }
      return '';
    };

    if (type === 'yearly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const isCurrentYear = targetYear === now.getFullYear();
      const currentMonth = now.getMonth();
      months.forEach((m, index) => {
        if (isCurrentYear && index > currentMonth) return;
        result.set(m, { period: m, totalCustomer: new Set(), totalBills: 0, totalQty: 0, onlinePayment: 0, codPayment: 0, totalAmount: 0, totalCodReturn: 0 });
      });
    } else if (type === 'monthly') {
      const monthIndex = monthParam ? parseInt(monthParam) : (targetYear === now.getFullYear() ? now.getMonth() : 11);
      const daysInMonth = new Date(targetYear, monthIndex + 1, 0).getDate();
      const isCurrentMonthAndYear = targetYear === now.getFullYear() && monthIndex === now.getMonth();
      const currentDay = now.getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        if (isCurrentMonthAndYear && i > currentDay) continue;
        const dateObj = new Date(targetYear, monthIndex, i);
        const dateStr = `${i} ${dateObj.toLocaleString('default', { month: 'short' })}`;
        result.set(dateStr, { period: dateStr, totalCustomer: new Set(), totalBills: 0, totalQty: 0, onlinePayment: 0, codPayment: 0, totalAmount: 0, totalCodReturn: 0 });
      }
    } else if (type === 'weekly') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const isCurrentYear = targetYear === now.getFullYear();
      const currentDayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
      days.forEach((d, index) => {
        if (isCurrentYear && index > currentDayIndex) return;
        result.set(d, { period: d, totalCustomer: new Set(), totalBills: 0, totalQty: 0, onlinePayment: 0, codPayment: 0, totalAmount: 0, totalCodReturn: 0 });
      });
    }

    orders.forEach(order => {
      const key = getGroupKey(order.createdAt);
      if (!result.has(key)) return;
      
      const group = result.get(key);
      const orderTotal = parseFloat(order.total) || 0;
      
      let orderQuantity = 0;
      order.items?.forEach((item: any) => {
        if (item.type === 'bundle' && item.bundleItems) {
          orderQuantity += (item.bundleItems as any[]).length * (item.quantity || 1);
        } else {
          orderQuantity += item.quantity || 0;
        }
      });

      if (order.status === 'CODReturn') {
        group.totalCodReturn += 1;
      } else if (order.status !== 'Abandoned' && order.status !== 'Failed' && order.status !== 'Cancelled') {
        group.totalBills += 1;
        group.totalQty += orderQuantity;
        group.totalAmount += orderTotal;
        if (order.userId) group.totalCustomer.add(order.userId);
        
        if (order.paymentMethod?.toLowerCase() === 'cod') {
          group.codPayment += orderTotal;
        } else {
          group.onlinePayment += orderTotal;
        }
      }
    });

    const finalResult = Array.from(result.values()).map(g => ({
      period: g.period,
      totalCustomer: g.totalCustomer.size,
      totalBills: g.totalBills,
      totalQty: g.totalQty,
      onlinePayment: Math.round(g.onlinePayment),
      codPayment: Math.round(g.codPayment),
      totalAmount: Math.round(g.totalAmount),
      totalCodReturn: g.totalCodReturn
    }));

    return finalResult;
  }

  async getTopSellingProducts() {
    const products = await this.prisma.orderItem.groupBy({
      by: ['productId', 'name', 'imageUrl'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
      where: { productId: { not: null } }
    });

    return products.map(p => ({
      id: p.productId,
      name: p.name,
      image: p.imageUrl,
      sold: p._sum.quantity
    }));
  }

  async getCurrentOffers() {
    const coupons = await this.prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { expiryDate: 'asc' },
      take: 3
    });

    return coupons.map(coupon => {
      const progress = coupon.usageLimit 
        ? Math.round((coupon.usageCount / coupon.usageLimit) * 100)
        : 60;
      
      return {
        title: coupon.type === 'percentage' 
          ? `${coupon.value}% Discount Offer`
          : `₹${coupon.value} Coupon`,
        status: coupon.expiryDate 
          ? `Expire on: ${new Date(coupon.expiryDate).toLocaleDateString('en-GB')}`
          : 'No expiry',
        progress,
        type: coupon.type === 'percentage' ? 'discount' : 'coupon'
      };
    });
  }

  async getRecentOrders() {
    const orders = await this.prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { select: { name: true, email: true, phone: true } },
        items: { select: { id: true } }
      }
    });

    return orders.map(order => {
      const shipping = order.shippingAddress as any;
      const profile = order.user;
      
      // Fallback logic: Shipping Name -> Profile Name -> 'Guest'
      let customerName = (shipping?.fullName || shipping?.name);
      if (!customerName || customerName.toLowerCase() === 'guest') {
        customerName = profile?.name || 'Guest';
      }

      // Fallback logic for Email
      let email = (shipping?.email);
      if (!email || email === '') {
        email = profile?.email || '';
      }

      // Fallback logic for Phone
      let phone = (shipping?.mobileNumber || shipping?.phone);
      if (!phone || phone === '') {
        phone = profile?.phone || '';
      }

      return {
        id: order.id,
        customer: customerName,
        email: email,
        phone: phone,
        items: order.items.length,
        total: `₹${parseFloat(order.total).toFixed(2)}`,
        status: order.status,
        date: order.createdAt.toLocaleDateString('en-GB')
      };
    });
  }
}
