import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  private prisma = new PrismaClient();

  private SUCCESS_STATUSES = ['Accepted', 'Shipped', 'Delivered'];

  create(createCustomerDto: CreateCustomerDto) {
    return 'This action adds a new customer';
  }


async findAll(
  page: number = 1,
  limit: number = 10,
  search: string = '',
  startDate?: string,
  endDate?: string,
  statusFilter?: string
) {
  const skip = (page - 1) * limit;

  const where: any = {};

  // 🔍 SEARCH
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  // 📅 DATE FILTER (SAFE)
  let orderDateFilter: any = undefined;

  if (startDate || endDate) {
    const createdAt: any = {};

    if (startDate && !isNaN(Date.parse(startDate))) {
      createdAt.gte = new Date(startDate);
    }

    if (endDate && !isNaN(Date.parse(endDate))) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      createdAt.lte = end;
    }

    if (Object.keys(createdAt).length > 0) {
      orderDateFilter = { createdAt };
    }
  }

  // 🎯 STATUS + DATE COMBINED FILTER
  if (statusFilter === 'login') {
    where.orders = {
      none: {
        status: { in: [...this.SUCCESS_STATUSES, 'Abandoned', 'Cancelled', 'Placed', 'Accepted'] },
      },
    };
  }
  else if (statusFilter === 'ordered') {
    where.orders = {
      some: {
        ...(orderDateFilter || {}),
        status: { in: this.SUCCESS_STATUSES },
      },
    };
  } 
  else if (statusFilter === 'cancelled') {
    where.orders = {
      some: {
        ...(orderDateFilter || {}),
        status: 'Cancelled',
      },
    };
  }
  else if (statusFilter === 'abandoned') {
    where.orders = {
      some: {
        ...(orderDateFilter || {}),
        status: 'Abandoned',
      },
    };
  } 
  else if (orderDateFilter) {
    where.orders = {
      some: orderDateFilter,
    };
  }

  // ✅ FETCH USERS
  const users = await this.prisma.user.findMany({
    where,
    include: {
      orders: {
        where: {
          ...(orderDateFilter || {}),
          status: { in: this.SUCCESS_STATUSES }, // ONLY valid orders
        },
        select: {
          paymentMethod: true,
          status: true,
          total: true,
          createdAt: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const total = await this.prisma.user.count({ where });

  const data = users.map((user) => ({
    id: user.id,
    name: user.name || 'N/A',
    email: user.email || 'N/A',
    phone: user.phone || 'N/A',
    ordersCount: user.orders.length, // ✅ only valid orders
    totalSpent: user.orders.reduce(
      (sum, order) => sum + parseFloat(order.total || '0'),
      0
    ),
    status: user.isActive ? 'Active' : 'Inactive',
    joinDate: user.createdAt,
    lastOrder:
      user.orders.length > 0
        ? user.orders.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          )[0].createdAt
        : null,
  }));

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
async getCustomerStats(startDate?: string, endDate?: string) {
  try {
    // 📅 ORDER DATE FILTER (for orders)
    const orderDateFilter: any = {};

    if (startDate || endDate) {
      orderDateFilter.createdAt = {};

      if (startDate && !isNaN(Date.parse(startDate))) {
        orderDateFilter.createdAt.gte = new Date(startDate);
      }

      if (endDate && !isNaN(Date.parse(endDate))) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        orderDateFilter.createdAt.lte = end;
      }

      if (Object.keys(orderDateFilter.createdAt).length === 0) {
        delete orderDateFilter.createdAt;
      }
    }

    // 📅 USER DATE FILTER (for total + login)
    const userDateFilter: any = {};

    if (startDate || endDate) {
      userDateFilter.createdAt = {};

      if (startDate && !isNaN(Date.parse(startDate))) {
        userDateFilter.createdAt.gte = new Date(startDate);
      }

      if (endDate && !isNaN(Date.parse(endDate))) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        userDateFilter.createdAt.lte = end;
      }

      if (Object.keys(userDateFilter.createdAt).length === 0) {
        delete userDateFilter.createdAt;
      }
    }

    // ✅ Total customers (NOW FILTERED)
    const totalCustomers = await this.prisma.user.count({
      where: userDateFilter,
    });

    // ✅ Login only customers (logged in but NO orders, abandoned, or cancelled)
    const loginCustomers = await this.prisma.user.count({
      where: {
        ...userDateFilter,
        orders: {
          none: {
            status: { in: [...this.SUCCESS_STATUSES, 'Abandoned', 'Cancelled', 'Placed', 'Accepted'] },
          },
        },
      },
    });

    // ✅ Ordered customers
    const orderedCustomers = await this.prisma.order.groupBy({
      by: ['userId'],
      where: {
        ...orderDateFilter,
        status: { in: this.SUCCESS_STATUSES },
      },
    });

    // ✅ Cancelled customers
    const cancelledCustomers = await this.prisma.order.groupBy({
      by: ['userId'],
      where: {
        ...orderDateFilter,
        status: 'Cancelled',
      },
    });

    // ✅ Abandoned customers
    const abandonedCustomers = await this.prisma.order.groupBy({
      by: ['userId'],
      where: {
        ...orderDateFilter,
        status: 'Abandoned',
      },
    });

    return {
      totalCustomers,
      loginCustomers,
      orderedCustomers: orderedCustomers.length,
      cancelledCustomers: cancelledCustomers.length,
      abandonedCustomers: abandonedCustomers.length,
    };

  } catch (error) {
    console.error('Error fetching customer stats:', error);
    throw new Error('Failed to fetch customer stats');
  }
}
 
  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            createdAt: true,
          },
        },
      },
    });
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async searchByPhone(phone: string) {
    if (!phone || phone.length < 3) return [];

    return this.prisma.user.findMany({
      where: {
        phone: { contains: phone },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      },
      take: 10,
    });
  }
}