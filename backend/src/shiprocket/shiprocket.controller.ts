import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { ShiprocketService } from './shiprocket.service';
import { OrderService } from '../order/order.service';

@Controller('webhook')
export class ShiprocketController {
  constructor(
    private readonly shiprocketService: ShiprocketService,
    private readonly orderService: OrderService
  ) {}

  @Post('create')
  async createShiprocketOrder(@Body() body: { orderId: number }) {
    return this.shiprocketService.createShiprocketOrder(body.orderId);
  }

  @Post('tracking-update')
  async handleWebhook(@Body() payload: any, @Headers('x-api-key') apiKey: string) {
    // Security check: verify the token set in Shiprocket dashboard
    if (apiKey !== 'mysecret123') {
      console.error('Unauthorized webhook attempt - invalid x-api-key:', apiKey);
      return { success: false, message: 'Unauthorized' };
    }

    // Shiprocket sends status updates to this endpoint
    console.log('=== SHIPROCKET WEBHOOK RECEIVED ===');
    console.log('Time:', new Date().toLocaleString());
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const { order_id, status, scourior_name, awb_code, tracking_url } = payload;

    if (!order_id) {
      console.error('CRITICAL: Missing order_id in Shiprocket webhook payload');
      return { success: false, message: 'Missing order_id' };
    }

    const dbOrderId = parseInt(order_id);
    if (isNaN(dbOrderId)) {
      console.error('CRITICAL: Invalid order_id in Shiprocket webhook:', order_id);
      return { success: false, message: 'Invalid order_id' };
    }

    console.log(`Processing update for Order #${dbOrderId}`);

    let internalStatus: string | null = null;
    const shiprocketStatus = status ? status.toUpperCase() : 'UNKNOWN';
    console.log(`Shiprocket reported status: ${shiprocketStatus}`);

    // Mapping based on user request:
    // NEW -> Accepted
    // PICKED UP -> Shipped
    // IN TRANSIT -> Shipped
    // OUT FOR DELIVERY -> Shipped
    // DELIVERED -> Delivered
    // CANCELLED -> Cancelled
    // RTO (Return) -> Cancelled

    switch (shiprocketStatus) {
      case 'NEW':
        internalStatus = 'Accepted';
        break;
      case 'PICKED UP':
      case 'IN TRANSIT':
      case 'OUT FOR DELIVERY':
        internalStatus = 'Shipped';
        break;
      case 'DELIVERED':
        internalStatus = 'Delivered';
        break;
      case 'CANCELED':
      case 'CANCELLED':
      case 'RTO (RETURN)':
      case 'RTO':
        internalStatus = 'Cancelled';
        break;
      default:
        console.log(`NOTICE: Shiprocket status "${shiprocketStatus}" not mapped to any internal status. No status change will be made.`);
        break;
    }

    if (internalStatus) {
      console.log(`Mapped Shiprocket status "${shiprocketStatus}" to internal status: "${internalStatus}"`);
    }

    try {
      if (internalStatus || scourior_name || awb_code || tracking_url) {
        console.log(`Updating database for Order #${dbOrderId}...`);
        console.log({
          status: internalStatus || 'no change',
          courier: scourior_name || 'no change',
          awb: awb_code || 'no change',
          url: tracking_url || 'no change'
        });

        await this.orderService.updateOrderStatus(
          dbOrderId,
          internalStatus || undefined,
          undefined, // invoiceUrl
          undefined, // packageSlipUrl
          scourior_name || undefined,
          awb_code || undefined,
          tracking_url || undefined
        );
        console.log(`=== SUCCESS: Order #${dbOrderId} updated successfully ===`);
      } else {
        console.log(`=== SKIP: No relevant data to update for Order #${dbOrderId} ===`);
      }
      return { success: true };
    } catch (error) {
      console.error(`=== ERROR: Failed to update Order #${dbOrderId} via webhook ===`);
      console.error('Error message:', error.message);
      return { success: false, error: error.message };
    }
  }
}
