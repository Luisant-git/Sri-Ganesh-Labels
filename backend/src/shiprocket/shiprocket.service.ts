import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ShiprocketService {
  private readonly baseUrl = 'https://apiv2.shiprocket.in/v1/external';
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(private prisma: PrismaService) {}

  private async login() {
    // Check if token is still valid (Shiprocket tokens usually last 24h)
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      console.log('Attempting Shiprocket login...');
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        email: 'en3fashions@gmail.com',
        password: 'RLq1WuMnejxytCnMC$7*tah2yW*@2jCD',
      });

      this.token = response.data.token;
      this.tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
      console.log('Shiprocket login successful. Token acquired.');
      return this.token;
    } catch (error) {
      console.error('Shiprocket login failed:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to authenticate with Shiprocket');
    }
  }

  async createShiprocketOrder(orderId: number) {
    console.log(`=== STARTING SHIPROCKET ORDER CREATION FOR ORDER #${orderId} ===`);
    const token = await this.login();
    
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    });

    if (!order) {
      console.error(`Order #${orderId} not found for Shiprocket creation`);
      throw new Error('Order not found');
    }

    const shippingAddress: any = order.shippingAddress;
    
    const totalAmount = parseFloat(order.total);
    const originalSubtotal = order.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    
    const shiprocketData = {
      order_id: order.id.toString(),
      order_date: order.createdAt.toISOString().split('T')[0],
      pickup_location: "warehouse",
      billing_customer_name: shippingAddress.fullName || order.user?.name || 'Customer',
      billing_last_name: "",
      billing_address: shippingAddress.addressLine1,
      billing_address_2: shippingAddress.addressLine2 || "",
      billing_city: shippingAddress.city,
      billing_pincode: shippingAddress.pincode,
      billing_state: shippingAddress.state,
      billing_country: "India",
      billing_email: order.user?.email || "customer@example.com",
      billing_phone: shippingAddress.mobile || order.user?.phone || "",
      shipping_is_billing: true,
      order_items: order.items.map(item => {
        const itemPrice = parseFloat(item.price);
        // Calculate proportional price so sum of items equals final total
        const proportionalPrice = originalSubtotal > 0 
          ? (itemPrice * (totalAmount / originalSubtotal)) 
          : itemPrice;
          
        return {
          name: item.name,
          sku: item.sizeVariantId || item.productId?.toString() || 'SKU',
          units: item.quantity,
          selling_price: Math.round(proportionalPrice * 100) / 100,
          discount: 0,
          tax: 0,
          hsn: item.hsnCode || ""
        };
      }),
      payment_method: order.paymentMethod.toUpperCase() === 'COD' ? 'Postpaid' : 'Prepaid',
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: totalAmount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5
    };

    console.log('Sending data to Shiprocket:', JSON.stringify(shiprocketData, null, 2));

    try {
      const response = await axios.post(`${this.baseUrl}/orders/create/adhoc`, shiprocketData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Shiprocket response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Shiprocket order creation failed:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to create Shiprocket shipment');
    }
  }

  async getTrackingInfo(shipmentId: string) {
    const token = await this.login();
    try {
      const response = await axios.get(`${this.baseUrl}/courier/track/shipment/${shipmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Shiprocket tracking failed:', error.response?.data || error.message);
      return null;
    }
  }
}
