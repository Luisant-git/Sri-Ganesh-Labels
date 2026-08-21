import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CouponService } from '../coupon/coupon.service';
import { PaymentService } from './payment.service';
import { EmailService } from '../email/email.service';

function normalizeState(value: string): string {
  const raw = (value || '').trim();
  if (!raw) return '';

  const compact = raw
    .toUpperCase()
    .replace(/&/g, ' AND ')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const aliases: Record<string, string> = {
    'ANDAMAN AND NICOBAR ISLANDS': 'ANDAMAN_NICOBAR',
    'DADRA AND NAGAR HAVELI AND DAMAN AND DIU': 'DADRA_NAGAR_HAVELI',
  };

  if (aliases[compact]) return aliases[compact];

  return compact
    .replace(/\s+AND\s+/gi, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_ISLANDS$/g, '')
    .replace(/_CITY$/g, '');
}
 
@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private couponService: CouponService,
    private paymentService: PaymentService,
    private emailService: EmailService
  ) {}
 
  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    // Get user's cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true }
    });
 
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Final stock validation before order creation
    await this.validateItemsStock(cart.items);
 
    // Apply coupon if provided
    let discount = '0';
    let couponCode: string | null = null;
    if (createOrderDto.couponCode) {
      try {
        const result = await this.couponService.validateCoupon(
          createOrderDto.couponCode,
          userId,
          parseFloat(createOrderDto.subtotal),
          parseFloat(createOrderDto.deliveryFee || '0'),
          parseFloat(createOrderDto.codFee || '0'),
          cart.items.map(item => ({
            productId: item.productId ?? undefined,
            price: parseFloat(item.price) || 0,
            quantity: item.quantity || 1,
          }))
        );
        discount = result.discount.toString();
        couponCode = createOrderDto.couponCode;
        await this.couponService.applyCoupon(result.coupon.id, userId);
      } catch (error) {
        throw new Error('Invalid coupon: ' + error.message);
      }
    }

    // Validate COD if selected
    if (createOrderDto.paymentMethod === 'cod') {
      const shippingAddress = createOrderDto.shippingAddress;
      
      // First check pincode-level COD availability
      const pincode = await this.prisma.pincode.findUnique({
        where: { pincode: shippingAddress.pincode }
      });
      
      if (pincode && pincode.codAvailable === false) {
        throw new Error('Cash on Delivery is not available for this pincode');
      }

      // Then check state-level COD availability from ShippingRule
      if (shippingAddress.state) {
        const stateEnum = normalizeState(shippingAddress.state);
        const shippingRule = await this.prisma.shippingRule.findUnique({
          where: { state: stateEnum as any }
        });
        
        if (shippingRule && shippingRule.codAvailable === false) {
          throw new Error(`Cash on Delivery is not available for ${shippingAddress.state}`);
        }
      }
    }
  
    // Determine order status
    // RAZORPAY DISABLED (temporarily): treat every order as Placed until real keys are added
    // const orderStatus = createOrderDto.paymentMethod === 'online' ? 'Pending' : 'Placed';
    const orderStatus = 'Placed';
 
    // Create Razorpay order for online payments
    // let razorpayOrderId: string | null = null;
    // if (createOrderDto.paymentMethod === 'online') {
    //   const razorpayOrder = await this.paymentService.createOrder(parseFloat(createOrderDto.total));
    //   razorpayOrderId = razorpayOrder.id;
    // }

    // Update user's shipping address (excluding mobile number)
    const shippingAddressToSave = {
      name: createOrderDto.shippingAddress.fullName,
      addressLine: createOrderDto.shippingAddress.addressLine1,
      addressLine2: createOrderDto.shippingAddress.addressLine2,
      landmark: createOrderDto.shippingAddress.landmark,
      city: createOrderDto.shippingAddress.city,
      state: createOrderDto.shippingAddress.state,
      pincode: createOrderDto.shippingAddress.pincode
      // Note: mobile number is excluded from profile update
    };

    // Update user's profile with new shipping address and keep account name in sync
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: createOrderDto.shippingAddress.fullName?.trim() || undefined,
        shippingAddress: shippingAddressToSave
      }
    });

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        userId,
        status: orderStatus,
        subtotal: createOrderDto.subtotal,
        deliveryFee: createOrderDto.deliveryFee,
        shippingFee: createOrderDto.shippingFee || '0',
        codFee: createOrderDto.codFee || '0',
        discount,
        couponCode,
        total: createOrderDto.total,
        paymentMethod: createOrderDto.paymentMethod,
        shippingAddress: JSON.parse(JSON.stringify(createOrderDto.shippingAddress)),
        deliveryOption: JSON.parse(JSON.stringify(createOrderDto.deliveryOption)),
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            size: item.size,
            color: item.color,
            sizeVariantId: item.sizeVariantId,
            quantity: item.quantity,
            type: item.type,
            bundleItems: item.bundleItems ? JSON.parse(JSON.stringify(item.bundleItems)) : undefined,
            hsnCode: item.hsnCode
          }))
        }
      } as any,
      include: { items: true }
    });
 
    // Clear cart only for COD orders (Placed status)
    // For online payments (Pending status), cart will be cleared after payment verification
    if (orderStatus === 'Placed') {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
      
      // Deduct stock for COD orders
      await this.deductStock((order as any).items);
    }
 
    const finalOrder = await this.prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: true,
        user: { select: { id: true, email: true, name: true, phone: true } }
      }
    });

    if (finalOrder) {
      await this.emailService.sendOrderStatusEmail(finalOrder, 'Placed');
    }

    // Return order with Razorpay order ID for online payments
    return {
      ...order,
      // razorpayOrderId
    };
  }
 
  async getUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
  }
 
  async getOrderById(userId: number, orderId: number) {
    return this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true }
    });
  }

  async getPublicOrder(orderId: number) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });
  }
 
  async getAllOrders() {
    return this.prisma.order.findMany({
      include: { items: true, user: { select: { id: true, email: true, name: true, phone: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }
async getOrderStats(startDate?: string, endDate?: string) {
  try {
    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        dateFilter.createdAt.lte = endDateTime;
      }
    }

    // Get all orders with date filter
    const orders = await this.prisma.order.findMany({
      where: dateFilter,
      include: {
        items: true
      }
    });

    let totalSales = 0;
    const uniqueCustomers = new Set<number>();
    const uniqueReturnCustomers = new Set<number>();
    let totalQuantity = 0;
    let totalValue = 0;
    let totalShippingValue = 0;
    let totalCodValue = 0;
    let totalOnlineValue = 0;
    let totalCodReturnValue = 0;
    let totalCommission = 0;
    let totalSettlement = 0;
    let totalCodBills = 0;
    let totalOnlineBills = 0;
    let totalCodQuantity = 0;
    let totalOnlineQuantity = 0;
    let totalCodShipping = 0;
    let totalOnlineShipping = 0;
    let totalCodCommission = 0;
    let totalOnlineCommission = 0;
    let totalCodSettlement = 0;
    let totalOnlineSettlement = 0;
    let totalBaseValue = 0;
    let totalCodBaseValue = 0;
    let totalOnlineBaseValue = 0;
    let totalDiscount = 0;
    let totalCodDiscount = 0;
    let totalOnlineDiscount = 0;
    let totalCodReturnBills = 0;
    let totalCodReturnQuantity = 0;
    let totalCodReturnBaseValue = 0;
    let totalCodReturnDiscount = 0;
    let totalCodReturnShipping = 0;
    let totalCodReturnCommission = 0;
    let totalCodReturnSettlement = 0;

    // Statuses to include in main calculations (excludes CODReturn)
    const includeStatuses = ['Accepted', 'Shipped', 'Delivered'];

    orders.forEach(order => {
      // Use stored subtotal as base value (original checkout calculation)
      // This matches the Excel report subtotal column
      const orderBaseValue = parseFloat(order.subtotal) || 0;
      let orderQuantity = 0;
      order.items?.forEach(item => {
        if (item.type === 'bundle' && item.bundleItems) {
          const bundleItems = item.bundleItems as any[];
          orderQuantity += bundleItems.length * (item.quantity || 1);
        } else {
          orderQuantity += item.quantity || 0;
        }
      });

      const orderTotal = parseFloat(order.total) || 0;
      const orderDiscount = parseFloat(order.discount || '0') || 0;
      const orderCommission = parseFloat(order.codCharge as any) || 0;

      // 1. Process active/successful sales metrics
      if (includeStatuses.includes(order.status)) {
        totalSales += 1;
        totalQuantity += orderQuantity;
        totalBaseValue += orderBaseValue;
        totalValue += orderTotal;
        totalDiscount += orderDiscount;
        totalCommission += orderCommission;

        const settlement = orderTotal - orderCommission;
        totalSettlement += settlement;

        if (order.paymentMethod === 'cod') {
          totalCodBills += 1;
          totalCodQuantity += orderQuantity;
          totalCodBaseValue += orderBaseValue;
          totalCodValue += orderTotal;
          totalCodDiscount += orderDiscount;
          totalCodCommission += orderCommission;
          totalCodSettlement += settlement;
        } else {
          totalOnlineBills += 1;
          totalOnlineQuantity += orderQuantity;
          totalOnlineBaseValue += orderBaseValue;
          totalOnlineValue += orderTotal;
          totalOnlineDiscount += orderDiscount;
          totalOnlineCommission += orderCommission;
          totalOnlineSettlement += settlement;
        }

        if (order.userId) {
          uniqueCustomers.add(order.userId);
        }
      }
      
      // 2. Process COD Return (RTO) metrics separately
      if (order.status === 'CODReturn') {
        totalCodReturnBills += 1;
        totalCodReturnQuantity += orderQuantity;
        totalCodReturnBaseValue += orderBaseValue;
        totalCodReturnValue += orderTotal;
        totalCodReturnDiscount += orderDiscount;
        totalCodReturnCommission += orderCommission;
        // RTO settlement is 0 since no cash is collected
        totalCodReturnSettlement += 0;

        if (order.userId) {
          uniqueCustomers.add(order.userId);
          uniqueReturnCustomers.add(order.userId);
        }
      }

      // 3. Process Shipping Expenses (include CODReturn since shipping is still paid)
      if ([...includeStatuses, 'CODReturn'].includes(order.status)) {
        const shippingCharge = parseFloat(order.courierCharge as any) || 0;
        totalShippingValue += shippingCharge;
        
        if (order.status === 'CODReturn') {
          totalCodReturnShipping += shippingCharge;
        } else if (order.paymentMethod === 'cod') {
          totalCodShipping += shippingCharge;
        } else {
          totalOnlineShipping += shippingCharge;
        }
      }
    });

    return {
      totalSales,
      totalCustomers: uniqueCustomers.size,
      totalQuantity,
      totalValue,
      totalShippingValue,
      totalCodValue,
      totalOnlineValue,
      totalCodReturnValue,
      totalCommission,
      totalSettlement,
      totalCodBills,
      totalOnlineBills,
      totalCodQuantity,
      totalOnlineQuantity,
      totalCodShipping,
      totalOnlineShipping,
      totalCodCommission,
      totalOnlineCommission,
      totalCodSettlement,
      totalOnlineSettlement,
      totalBaseValue,
      totalCodBaseValue,
      totalOnlineBaseValue,
      totalDiscount,
      totalCodDiscount,
      totalOnlineDiscount,
      totalCodReturnBills,
      totalCodReturnQuantity,
      totalCodReturnBaseValue,
      totalCodReturnDiscount,
      totalCodReturnShipping,
      totalCodReturnCommission,
      totalCodReturnSettlement,
      totalCodReturnCustomers: uniqueReturnCustomers.size
    };
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw new Error('Failed to fetch order statistics');
  }
}
  async updateOrderStatus(
  orderId: number, 
  status?: string, 
  invoiceUrl?: string, 
  packageSlipUrl?: string, 
  courierName?: string, 
  trackingId?: string, 
  trackingLink?: string, 
  cancelRemarks?: string,
  codReturnRemarks?: string,
  chargedWeight?: number,    // For Shipped status
  courierCharge?: number,
  codCharge?: number         // For Delivered status
) {
  const updateData: any = {};
  if (status) updateData.status = status;
  if (invoiceUrl) updateData.invoiceUrl = invoiceUrl;
  if (packageSlipUrl) updateData.packageSlipUrl = packageSlipUrl;
  if (courierName && courierName !== "not provided") updateData.courierName = courierName;
  if (trackingId && trackingId !== "not provided") updateData.trackingId = trackingId;
  if (trackingLink && trackingLink !== "not provided") updateData.trackingLink = trackingLink;
  if (courierCharge != null) updateData.courierCharge = courierCharge;
  
  // Use chargedWeight only when status is 'Shipped'
  if (status === 'Shipped' && chargedWeight != null) {
    updateData.chargedWeight = chargedWeight;
  }
  
  // Use codCharge only when status is 'Delivered'
  if (status === 'Delivered' && codCharge != null) {
    updateData.codCharge = codCharge;
  }

  if (status === 'Cancelled') {
    updateData.cancelRemarks = cancelRemarks || null;
    updateData.codReturnRemarks = null;
  } else if (status === 'CODReturn') {
    updateData.codReturnRemarks = codReturnRemarks || null;
    updateData.cancelRemarks = null;
  } else if (status) {
    // if we are changing away from Cancelled or CODReturn, clear remarks
    updateData.cancelRemarks = null;
    updateData.codReturnRemarks = null;
  }
  
  const existingOrder = await this.prisma.order.findUnique({
    where: { id: orderId }
  });

  const protectedStatuses = ['Placed', 'Accepted', 'Shipped', 'Delivered', 'Cancelled'];
  if (status === 'Abandoned' && existingOrder && protectedStatuses.includes(existingOrder.status)) {
    console.log(`Prevented marking a ${existingOrder.status} order (${orderId}) as Abandoned`);
    // Even if we don't update status, we should still update other fields if provided
    if (Object.keys(updateData).length > 1) {
      delete updateData.status;
    } else {
      return existingOrder;
    }
  }

  const order = await this.prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: { items: true, user: { select: { id: true, email: true, name: true, phone: true } } }
  });

  // If payment successful, clear cart and send WhatsApp
  if (status === 'Placed') {
    // Clear user's cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId: order.userId }
    });
    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }

    // Deduct stock for online orders (after payment verification)
    if (existingOrder?.status !== 'Placed') {
      await this.deductStock((order as any).items);
    }
  }

  if (status) {
    await this.emailService.sendOrderStatusEmail(order, status);
  }

  return order;
}

  async updateOrderAddress(orderId: number, shippingAddress: any) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { shippingAddress },
      include: { items: true },
    });
  }

  async removeOrderItem(orderId: number, itemId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new Error('Order not found');

    const item = (order.items as any[]).find(i => i.id === itemId);
    if (!item) throw new Error('Item not found');

    // Restore stock for removed item
    await this.restoreStock([item]);

    // Delete the item
    await this.prisma.orderItem.delete({ where: { id: itemId } });

    // Recalculate subtotal from remaining items
    const remaining = (order.items as any[]).filter(i => i.id !== itemId);
    const newSubtotal = remaining.reduce((sum, i) => {
      if (i.type === 'bundle' && i.bundleItems) {
        return sum + (i.bundleItems as any[]).reduce((s, b) => s + (parseFloat(b.originalPrice) || 0), 0);
      }
      return sum + (parseFloat(i.price) || 0) * (i.quantity || 1);
    }, 0);

    const discount = parseFloat(order.discount ?? '0') || 0;
    const deliveryFee = parseFloat(order.deliveryFee) || 0;
    const shippingFee = parseFloat((order as any).shippingFee) || 0;
    const codFee = parseFloat((order as any).codFee) || 0;
    const newTotal = newSubtotal - discount + deliveryFee + shippingFee + codFee;

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        subtotal: newSubtotal.toFixed(2),
        total: newTotal.toFixed(2),
      },
      include: { items: true },
    });
  }

  async updateOrderItems(orderId: number, newItems: any[], subtotal?: number, total?: number) {
    // Get existing order items to restore their stock
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });
    if (!existingOrder) throw new Error('Order not found');

    // Restore stock for old items
    await this.restoreStock(existingOrder.items as any[]);

    // Update order items in DB
    await this.prisma.orderItem.deleteMany({ where: { orderId } });
    await this.prisma.orderItem.createMany({
      data: newItems.map(item => ({
        orderId,
        productId: item.productId || null,
        name: item.name,
        price: String(item.price),
        imageUrl: item.imageUrl,
        size: item.size || null,
        color: item.color || null,
        sizeVariantId: item.sizeVariantId || null,
        quantity: parseInt(item.quantity) || 1,
        type: item.type || 'single',
        bundleItems: item.bundleItems || null,
        hsnCode: item.hsnCode || null,
      }))
    });

    // Deduct stock for new items
    await this.deductStock(newItems);

    // Update subtotal and total if provided
    const updateData: any = {};
    if (subtotal !== undefined) {
      updateData.subtotal = subtotal.toString();
    }
    if (total !== undefined) {
      updateData.total = total.toString();
    }

    return this.prisma.order.update({ 
      where: { id: orderId }, 
      data: updateData,
      include: { items: true } 
    });
  }

  private async restoreStock(orderItems: any[]) {
    // Stock tracking removed with color/size variants
  }

  async cleanupOldPendingOrders() {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const result = await this.prisma.order.updateMany({
      where: {
        status: 'Pending',
        createdAt: { lt: thirtyMinutesAgo }
      },
      data: { status: 'Abandoned' }
    });

    if (result.count > 0) {
      console.log(`Cleaned up ${result.count} old pending orders`);
    }
    
    return result.count;
  }

  private async validateItemsStock(items: any[]) {
    // Stock tracking removed with color/size variants
  }

  private async deductStock(orderItems: any[]) {
    // Stock tracking removed with color/size variants
  }

  async logSystemError(userId: number | null, orderId: number | null, status: string | null, action: string, errorMessage: string) {
    try {
      await this.prisma.systemErrorLog.create({
        data: { userId, orderId, status, action, errorMessage }
      });
      console.log(`[System Error Logged] Action: ${action} | Error: ${errorMessage}`);
    } catch (e) {
      console.error('CRITICAL: Failed to write to SystemErrorLog database table:', e.message);
    }
  }


// Sales Report - Get orders with status 'Accepted', 'Shipped', 'Delivered', 'CODReturn', or 'Cancelled'
// For cancelled orders, all financial values will be 0
async getSalesReport(startDate?: string, endDate?: string) {
  try {
    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        dateFilter.createdAt.lte = endDateTime;
      }
    }

    const orders = await this.prisma.order.findMany({
      where: {
        status: {
          in: ['Accepted', 'Shipped', 'Delivered', 'CODReturn', 'Cancelled']
        },
        ...dateFilter
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return orders.map(order => {
      const isCancelled = order.status === 'Cancelled';
      
      // Handle null values by providing default '0' string first, then parse
      const subtotalStr = order.subtotal || '0';
      const discountStr = order.discount || '0';
      const deliveryFeeStr = order.deliveryFee || '0';
      const codFeeStr = order.codFee || '0';
      const totalStr = order.total || '0';

      // If cancelled, set all financial values to 0
      return {
        id: order.id,
        orderId: `ORD-${order.id}`,
        customer: order.user?.name || (order.shippingAddress as any)?.fullName || 'N/A',
        phone: order.user?.phone || (order.shippingAddress as any)?.mobile || 'N/A',
        email: order.user?.email || 'N/A',
        city: (order.shippingAddress as any)?.city || 'N/A',
        state: (order.shippingAddress as any)?.state || 'N/A',
        orderDate: order.createdAt,
        shippingDate: order.status === 'Shipped' || order.status === 'Delivered' ? order.updatedAt : null,
        status: order.status,
        trackingId: order.trackingId || '-',
        cancelRemarks: order.cancelRemarks || 'N/A',
        // Financial values - set to 0 for cancelled orders
        // productValue uses stored subtotal (original checkout value)
        productValue: isCancelled ? 0 : parseFloat(subtotalStr),
        subtotal: isCancelled ? 0 : parseFloat(subtotalStr),
        discount: isCancelled ? 0 : parseFloat(discountStr),
        deliveryFee: parseFloat(deliveryFeeStr),
        shippingFee: isCancelled ? 0 : parseFloat((order as any).shippingFee || '0'),
        codFee: isCancelled ? 0 : parseFloat(codFeeStr),
        codCharge: (order.codCharge || 0),
        courierCharge: (order.courierCharge || 0),
        total: isCancelled ? 0 : parseFloat(totalStr),
        chargedWeight: (order.chargedWeight || 0),
        settlementAmt: isCancelled ? (-(order.courierCharge || 0) - (order.codCharge || 0)) : (parseFloat(totalStr) - (order.codCharge || 0)),
        paymentMethod: order.paymentMethod,
        couponCode: order.couponCode || 'N/A',
        items: order.items,
        itemsCount: order.items.length,
        quantity: order.items.reduce((sum, item) => {
          if (item.type === 'bundle' && item.bundleItems) {
            return sum + (item.bundleItems as any[]).length;
          }
          return sum + (item.quantity || 0);
        }, 0)
      };
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    throw new Error('Failed to fetch sales report');
  }
}
// Shipping Report - Get orders with status 'Shipped' or 'Delivered'
async getShippingReport(startDate?: string, endDate?: string) {
  try {
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        dateFilter.createdAt.lte = endDateTime;
      }
    }

    const orders = await this.prisma.order.findMany({
      where: {
        status: {
          in: ['Shipped', 'Delivered']
        },
        ...dateFilter
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return orders.map(order => {
      // Parse all values correctly
      const subtotal = order.subtotal ? parseFloat(order.subtotal) : 0;
      const deliveryFee = order.deliveryFee ? parseFloat(order.deliveryFee) : 0;
      const codFee = order.codFee ? parseFloat(order.codFee) : 0;
      const discount = order.discount ? parseFloat(order.discount) : 0;
      const total = order.total ? parseFloat(order.total) : 0;
      const courierCharge = order.courierCharge || 0;
      const chargedWeight = order.chargedWeight || 0;
      
      // Calculate quantity
      const quantity = order.items.reduce((sum, item) => {
        if (item.type === 'bundle' && item.bundleItems) {
          return sum + (item.bundleItems as any[]).length;
        }
        return sum + (item.quantity || 0);
      }, 0);
      
      // Settlement Amount = Total - COD/online commission (Admin)
      const settlementAmt = total - (order.codCharge || 0);
      
      return {
        id: order.id,
        orderId: `ORD-${order.id}`,
        customer: order.user?.name || (order.shippingAddress as any)?.fullName || 'N/A',
        phone: order.user?.phone || (order.shippingAddress as any)?.mobile || 'N/A',
        email: order.user?.email || 'N/A',
        city: (order.shippingAddress as any)?.city || 'N/A',
        state: (order.shippingAddress as any)?.state || 'N/A',
        orderDate: order.createdAt,
        shippingDate: order.updatedAt,
        status: order.status,
        trackingId: order.trackingId || '-',
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        shippingFee: order.shippingFee ? parseFloat(order.shippingFee) : 0,
        codFee: codFee,
        discount: discount,
        total: total,
        courierCharge: courierCharge,
        codCharge: order.codCharge || 0,
        chargedWeight: chargedWeight,
        settlementAmt: settlementAmt,
        paymentMethod: order.paymentMethod,
        couponCode: order.couponCode || 'N/A',
        items: order.items,
        itemsCount: order.items.length,
        quantity: quantity
      };
    });
  } catch (error) {
    console.error('Error fetching shipping report:', error);
    throw new Error('Failed to fetch shipping report');
  }
}

// Get shipping report summary
async getShippingReportSummary(startDate?: string, endDate?: string) {
  try {
    const reportData = await this.getShippingReport(startDate, endDate);
    
    return {
      totalShipments: reportData.length,
      totalChargedWeight: reportData.reduce((sum, item) => sum + (item.chargedWeight || 0), 0),
      totalCourierCharges: reportData.reduce((sum, item) => sum + (item.courierCharge || 0), 0),
      totalAmount: reportData.reduce((sum, item) => sum + item.total, 0),
      totalSettlement: reportData.reduce((sum, item) => sum + item.settlementAmt, 0)
    };
  } catch (error) {
    console.error('Error fetching shipping report summary:', error);
    throw new Error('Failed to fetch shipping report summary');
  }
}



// Get sales report summary - Excludes cancelled orders from calculations
async getSalesReportSummary(startDate?: string, endDate?: string) {
  try {
    const reportData = await this.getSalesReport(startDate, endDate);
    
    // Filter out cancelled orders for summary calculations
    const activeOrders = reportData.filter(item => 
      item.status !== 'Cancelled'
    );
    
    // Get cancelled orders count (for display)
    const cancelledOrders = reportData.filter(item => 
      item.status === 'Cancelled'
    );
    
    return {
      // All orders count (including cancelled)
      totalOrdersAll: reportData.length,
      totalCancelledOrders: cancelledOrders.length,
      
      // Summary calculations excluding cancelled orders (amounts are 0 for cancelled)
      totalOrders: activeOrders.length,
      totalCustomers: new Set(activeOrders.map(item => item.phone)).size,
      totalQuantity: activeOrders.reduce((sum, item) => sum + item.quantity, 0),
      totalValue: activeOrders.reduce((sum, item) => sum + item.total, 0),
      totalShippingValue: activeOrders.reduce((sum, item) => sum + (item.courierCharge || 0), 0),
      totalCodValue: activeOrders.filter(item => item.paymentMethod === 'cod').reduce((sum, item) => sum + item.total, 0),
      totalDiscount: activeOrders.reduce((sum, item) => sum + item.discount, 0),
      totalDeliveryFee: activeOrders.reduce((sum, item) => sum + item.deliveryFee, 0),
      totalCodFee: activeOrders.reduce((sum, item) => sum + item.codFee, 0),
      totalCodCharge: activeOrders.reduce((sum, item) => sum + item.codCharge, 0),
      totalCourierCharge: activeOrders.reduce((sum, item) => sum + item.courierCharge, 0),
      totalSettlement: activeOrders.reduce((sum, item) => sum + item.settlementAmt, 0),
      
      // Breakdown by payment method
      totalCodBills: activeOrders.filter(item => item.paymentMethod === 'cod').length,
      totalOnlineBills: activeOrders.filter(item => item.paymentMethod !== 'cod').length,
      totalCodQuantity: activeOrders.filter(item => item.paymentMethod === 'cod').reduce((sum, item) => sum + item.quantity, 0),
      totalOnlineQuantity: activeOrders.filter(item => item.paymentMethod !== 'cod').reduce((sum, item) => sum + item.quantity, 0),
      totalCodShipping: activeOrders.filter(item => item.paymentMethod === 'cod').reduce((sum, item) => sum + item.courierCharge, 0),
      totalOnlineShipping: activeOrders.filter(item => item.paymentMethod !== 'cod').reduce((sum, item) => sum + item.courierCharge, 0),
      totalCodCommission: activeOrders.filter(item => item.paymentMethod === 'cod').reduce((sum, item) => sum + item.codCharge, 0),
      totalOnlineCommission: activeOrders.filter(item => item.paymentMethod !== 'cod').reduce((sum, item) => sum + item.codCharge, 0),
      totalCodSettlement: activeOrders.filter(item => item.paymentMethod === 'cod').reduce((sum, item) => sum + item.settlementAmt, 0),
      totalOnlineSettlement: activeOrders.filter(item => item.paymentMethod !== 'cod').reduce((sum, item) => sum + item.settlementAmt, 0)
    };
  } catch (error) {
    console.error('Error fetching sales report summary:', error);
    throw new Error('Failed to fetch sales report summary');
  }
}

// Get Product Sales Report - Shows delivered quantities with stock and sales amount
async getProductReport(startDate?: string, endDate?: string) {
  try {
    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        dateFilter.createdAt.lte = endDateTime;
      }
    }

    // Get all orders with Accepted, Shipped, or Delivered status
    const orders = await this.prisma.order.findMany({
      where: {
        status: {
          in: ['Accepted', 'Shipped', 'Delivered']
        },
        ...dateFilter
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        }
      }
    });

    // Get all products to fetch current prices
    const products = await this.prisma.product.findMany();

    // Map to store product variant data
    const productMap = new Map<string, any>();

    // Process each order with Accepted, Shipped, or Delivered status
    orders.forEach(order => {
      order.items.forEach(item => {
        // Handle bundle items
        if (item.type === 'bundle' && item.bundleItems) {
          const bundleItems = item.bundleItems as any[];
          const bundleQuantity = item.quantity || 1;
          const bundlePrice = parseFloat(item.price || '0');
          const bundleTotalPrice = bundlePrice * bundleQuantity;
          
          // Calculate sum of original prices to allocate proportionally
          const totalOriginalPrice = bundleItems.reduce((sum, b) => sum + (parseFloat(b.originalPrice) || 0), 0);
          
          bundleItems.forEach(bundleItem => {
            const key = `${item.productId || 'N/A'}_${bundleItem.color}_${bundleItem.size}_${bundleItem.sizeVariantId || 'N/A'}`;
            
            if (!productMap.has(key)) {
              productMap.set(key, {
                productId: item.productId || null,
                productName: item.name.split(' Bundle')[0],
                color: bundleItem.color,
                size: bundleItem.size,
                sizeVariantId: bundleItem.sizeVariantId || 'N/A',
                imageUrl: bundleItem.colorImage || item.imageUrl,
                hsnCode: item.hsnCode || 'N/A',
                deliveredQty: 0,
                totalSalesAmount: 0,
                sales: []
              });
            }
            
            const product = productMap.get(key);
            product.deliveredQty += bundleQuantity;
            
            // Allocate the bundle's actual selling price proportionally based on originalPrice
            let allocatedPrice = 0;
            let unitPrice = 0;
            if (totalOriginalPrice > 0) {
              const proportion = (parseFloat(bundleItem.originalPrice) || 0) / totalOriginalPrice;
              allocatedPrice = bundleTotalPrice * proportion;
              unitPrice = bundlePrice * proportion;
            } else {
              allocatedPrice = bundleTotalPrice / bundleItems.length;
              unitPrice = bundlePrice / bundleItems.length;
            }
            
            product.totalSalesAmount += allocatedPrice;
            product.sales.push({
              orderId: order.id,
              customer: order.user?.name || (order.shippingAddress as any)?.fullName || 'N/A',
              phone: order.user?.phone || (order.shippingAddress as any)?.mobile || 'N/A',
              quantity: bundleQuantity,
              price: unitPrice,
              date: order.createdAt,
              status: order.status,
              saleType: 'Bundle',
              parentName: item.name
            });
          });
        } else {
          // Handle single items
          const key = `${item.productId || 'N/A'}_${item.color}_${item.size}_${item.sizeVariantId || 'N/A'}`;
          
          if (!productMap.has(key)) {
            productMap.set(key, {
              productId: item.productId || null,
              productName: item.name,
              color: item.color,
              size: item.size,
              sizeVariantId: item.sizeVariantId || 'N/A',
              imageUrl: item.imageUrl,
              hsnCode: item.hsnCode || 'N/A',
              deliveredQty: 0,
              totalSalesAmount: 0,
              sales: []
            });
          }
          
          const product = productMap.get(key);
          const quantity = item.quantity || 1;
          const itemPrice = parseFloat(item.price || '0');
          product.deliveredQty += quantity;
          product.totalSalesAmount += itemPrice * quantity;
          product.sales.push({
            orderId: order.id,
            customer: order.user?.name || (order.shippingAddress as any)?.fullName || 'N/A',
            phone: order.user?.phone || (order.shippingAddress as any)?.mobile || 'N/A',
            quantity: quantity,
            price: itemPrice,
            date: order.createdAt,
            status: order.status,
            saleType: 'Single',
            parentName: null
          });
        }
      });
    });

    // Enrich with current price from products
    const productReport = Array.from(productMap.values()).map(item => {
      const product = products.find(p => p.id === item.productId);
      let currentPrice = product ? parseFloat(product.basePrice || '0') : 0;

      const deliveredQty = item.deliveredQty;
      const avgPrice = deliveredQty > 0 ? item.totalSalesAmount / deliveredQty : currentPrice;

      return {
        ...item,
        currentPrice,
        currentStock: 0,
        initialStock: deliveredQty,
        saleStock: deliveredQty,
        price: parseFloat(avgPrice.toFixed(2)),
        totalSalesAmount: parseFloat(item.totalSalesAmount.toFixed(2))
      };
    });

    // Sort by delivered quantity (descending)
    productReport.sort((a, b) => b.deliveredQty - a.deliveredQty);

    return productReport;
  } catch (error) {
    console.error('Error fetching product sales report:', error);
    throw new Error('Failed to fetch product sales report');
  }
}
}
