import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
 
@Injectable()
export class PaymentService {
  private razorpay: Razorpay;
 
  constructor() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not found in environment variables');
    }
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
 
  async createOrder(amount: number, currency: string = 'INR') {
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: `receipt_${Date.now()}`,
    };
    return this.razorpay.orders.create(options);
  }
 
  verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('RAZORPAY_KEY_SECRET not found in environment variables');
    }
    const text = `${orderId}|${paymentId}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');
    return generated_signature === signature;
  }
 
  async getPaymentMethod(paymentId: string): Promise<string> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment.method || 'online';
    } catch (error) {
      console.error('Error fetching payment method:', error);
      return 'online';
    }
  }
}