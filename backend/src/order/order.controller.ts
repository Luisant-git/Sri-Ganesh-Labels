import { Controller, Post, Get, Body, Param, UseGuards, Request, Patch, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentService } from './payment.service';
import { ShiprocketService } from '../shiprocket/shiprocket.service';
 
@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
    private readonly shiprocketService: ShiprocketService
  ) {}
 
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(req.user.userId, createOrderDto);
  }
 
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserOrders(@Request() req) {
    return this.orderService.getUserOrders(req.user.userId);
  }
 
  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(@Request() req, @Param('orderId') orderId: string) {
    return this.orderService.getOrderById(req.user.userId, parseInt(orderId));
  }
 
  @Get('admin/all')
  @ApiOperation({ summary: 'Get all orders (Admin)' })
  @ApiResponse({ status: 200, description: 'All orders retrieved successfully' })
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }
 
  @Get('admin/stats')
@ApiOperation({ summary: 'Get order statistics (Admin)' })
@ApiResponse({ status: 200, description: 'Order statistics retrieved successfully' })
async getOrderStats(
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
) {
  return this.orderService.getOrderStats(startDate, endDate);
}

  @Patch(':orderId/address')
  @ApiOperation({ summary: 'Update order shipping address (Admin)' })
  async updateOrderAddress(@Param('orderId') orderId: string, @Body() body: { shippingAddress: any }) {
    return this.orderService.updateOrderAddress(parseInt(orderId), body.shippingAddress);
  }

  @Patch(':orderId/items')
  @ApiOperation({ summary: 'Update order items with stock adjustment (Admin)' })
  async updateOrderItems(@Param('orderId') orderId: string, @Body() body: { items: any[], subtotal?: number, total?: number }) {
    return this.orderService.updateOrderItems(parseInt(orderId), body.items, body.subtotal, body.total);
  }

  @Patch(':orderId/remove-item')
  @ApiOperation({ summary: 'Remove a single item from order and update subtotal (Admin)' })
  async removeOrderItem(@Param('orderId') orderId: string, @Body() body: { itemId: number }) {
    return this.orderService.removeOrderItem(parseInt(orderId), body.itemId);
  }

  @Patch(':orderId/status')
  @ApiOperation({ summary: 'Update order status (Admin)' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrderStatus(@Param('orderId') orderId: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    let order;

    // 1. Database Level Status Change Attempt
    try {
      order = await this.orderService.updateOrderStatus(
        parseInt(orderId),
        updateOrderStatusDto.status,
        updateOrderStatusDto.invoiceUrl,
        updateOrderStatusDto.packageSlipUrl,
        updateOrderStatusDto.courierName,
        updateOrderStatusDto.trackingId,
        updateOrderStatusDto.trackingLink,
        updateOrderStatusDto.cancelRemarks,
        updateOrderStatusDto.codReturnRemarks,
        updateOrderStatusDto.chargedWeight,
        updateOrderStatusDto.courierCharge,
        updateOrderStatusDto.codCharge,
      );
    } catch (error) {
      // Catch native order update crashes
      await this.orderService.logSystemError(
        null, // We don't necessarily have the user ID loaded if it crashed here natively
        parseInt(orderId),
        updateOrderStatusDto.status,
        'GENERAL_STATUS_CHANGE',
        error.message || 'Unknown database error updating status'
      );
      throw error; // Let external API know it failed
    }

    // 2. Shiprocket Order Creation Trigger
    // Automatically push to Shiprocket if status is 'Accepted' and not already pushed
    if (updateOrderStatusDto.status === 'Accepted' && !order.trackingId) {
      try {
        console.log(`Auto-triggering Shiprocket creation for Order #${orderId} due to status change to "Accepted"`);
        await this.shiprocketService.createShiprocketOrder(parseInt(orderId));
      } catch (error) {
        console.error(`Failed to auto-create Shiprocket order for Order #${orderId}:`, error.message);
        
        // Log explicitly why shiprocket failed without throwing to avoid halting the core system
        await this.orderService.logSystemError(
          order.userId,
          parseInt(orderId),
          updateOrderStatusDto.status,
          'SHIPROCKET_ORDER_CREATION',
          error.message || 'Shiprocket API Gateway Timeout/Error'
        );
      }
    }

    return order;
  }
 
  @Post('payment/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Razorpay order' })
  async createPaymentOrder(@Body() body: { amount: number }) {
    return this.paymentService.createOrder(body.amount);
  }
 
  @Post('payment/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Razorpay payment' })
  async verifyPayment(@Request() req, @Body() body: any) {
    console.log('=== PAYMENT VERIFICATION STARTED ===');
    console.log('Raw request body:', req.body);
    console.log('Parsed body:', body);
    console.log('Body keys:', Object.keys(body));
    console.log('User ID:', req.user.userId);
    
    const { orderId, paymentId, signature, dbOrderId } = body;
    console.log('Extracted fields:');
    console.log('- orderId:', orderId);
    console.log('- paymentId:', paymentId);
    console.log('- signature:', signature);
    console.log('- dbOrderId:', dbOrderId);
    
    try {
      if (!orderId || !paymentId || !signature) {
        console.log('Missing required fields for signature verification');
        return { success: false, error: 'Missing payment verification data' };
      }
      
      const isValid = this.paymentService.verifyPayment(orderId, paymentId, signature);
      console.log('Payment signature valid:', isValid);
      
      if (isValid && dbOrderId) {
        console.log('Fetching order with ID:', dbOrderId);
        
        // Check if order exists
        const existingOrder = await this.orderService.getOrderById(req.user.userId, dbOrderId);
        
        if (!existingOrder) {
          console.log('Order not found for ID:', dbOrderId);
          return { success: false, error: 'Order not found' };
        }
        
        console.log(`Updating order ${dbOrderId} from ${existingOrder.status} to Placed`);
        
        // Update order status to Placed regardless of current status (Pending or Abandoned)
        await this.orderService.updateOrderStatus(dbOrderId, 'Placed');
        
        console.log('Order status updated successfully');
        
        // Cleanup old pending orders (instead of cron job)
        await this.orderService.cleanupOldPendingOrders();
        
        const paymentMethod = await this.paymentService.getPaymentMethod(paymentId);
        console.log('=== PAYMENT VERIFICATION SUCCESS ===');
        return { success: true, paymentMethod, orderStatus: 'Placed' };
      }
      
      console.log('Payment verification failed - invalid signature or missing dbOrderId');
      return { success: false, error: 'Payment verification failed' };
    } catch (error) {
      console.error('=== PAYMENT VERIFICATION ERROR ===');
      console.error('Error details:', error);
      return { success: false, error: 'Payment verification failed' };
    }
  }

  // Get Shipping Report
@Get('reports/shipping')
async getShippingReport(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
  try {
    const data = await this.orderService.getShippingReport(startDate, endDate);
    return {
      success: true,
      data,
      message: 'Shipping report fetched successfully'
    };
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}

// Get Shipping Report Summary
@Get('reports/shipping/summary')
async getShippingReportSummary(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
  try {
    const data = await this.orderService.getShippingReportSummary(startDate, endDate);
    return {
      success: true,
      data,
      message: 'Shipping report summary fetched successfully'
    };
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}

// Get Sales Report
@Get('reports/sales')
async getSalesReport(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
  try {
    const data = await this.orderService.getSalesReport(startDate, endDate);
    return {
      success: true,
      data,
      message: 'Sales report fetched successfully'
    };
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}

// Get Sales Report Summary
@Get('reports/sales/summary')
async getSalesReportSummary(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
  try {
    const data = await this.orderService.getSalesReportSummary(startDate, endDate);
    return {
      success: true,
      data,
      message: 'Sales report summary fetched successfully'
    };
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}

// Get Product Report
@Get('reports/products')
async getProductReport(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
  try {
    const data = await this.orderService.getProductReport(startDate, endDate);
    return {
      success: true,
      data,
      message: 'Product report fetched successfully'
    };
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}
}