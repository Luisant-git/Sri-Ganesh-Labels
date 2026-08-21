import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import * as os from 'os';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly email = process.env.EMAIL_USER;
  private readonly password = process.env.EMAIL_PASSWORD;

  constructor(private prisma: PrismaService) {
    if (!this.email || !this.password) {
      throw new Error('EMAIL_USER and EMAIL_PASSWORD must be set in the environment variables.');
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.email,
        pass: this.password,
      },
    });
  }

  private formatCurrency(value: number | string | null | undefined) {
    const numericValue = Number(value || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  }

  private getOrderAddress(order: any) {
    const shippingAddress = order?.shippingAddress || {};
    const fullName = shippingAddress.fullName || shippingAddress.name || order?.user?.name || 'Customer';
    const addressLine1 = shippingAddress.addressLine1 || shippingAddress.addressLine || '';
    const addressLine2 = shippingAddress.addressLine2 || '';
    const landmark = shippingAddress.landmark || '';
    const city = shippingAddress.city || '';
    const state = shippingAddress.state || '';
    const pincode = shippingAddress.pincode || '';

    return `${fullName}<br>${addressLine1}${addressLine1 && ', '}${addressLine2}${addressLine2 ? '<br>' : ''}${landmark ? `${landmark}<br>` : ''}${city}${city && state ? ', ' : ''}${state}${state && pincode ? ' - ' : ''}${pincode}`.trim();
  }

  private getStatusContent(order: any, status: string) {
    const orderId = order?.id || 'N/A';
    const customerName = order?.user?.name || order?.shippingAddress?.fullName || 'Customer';
    const orderTotal = this.formatCurrency(order?.total || 0);
    const trackingId = order?.trackingId || 'Not available yet';
    const invoiceUrl = order?.invoiceUrl;
    const trackingLink = order?.trackingLink;
    const cancelRemarks = order?.cancelRemarks || 'We are sorry to hear that your order was cancelled.';

    const itemRows = (order?.items || []).map((item: any) => {
      const qty = Number(item?.quantity || 1);
      const price = Number(item?.price || 0);
      const lineTotal = this.formatCurrency(price * qty);
      return `
        <tr>
          <td style="padding: 12px 10px; border-bottom: 1px solid #E5E7EB; text-align: left; font-size: 14px; color: #1F2937;">${item?.name || 'Product'}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #E5E7EB; text-align: center; font-size: 14px; color: #1F2937;">${item?.size || item?.color || '-'}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #E5E7EB; text-align: center; font-size: 14px; color: #1F2937;">${qty}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #E5E7EB; text-align: right; font-size: 14px; color: #1F2937;">${this.formatCurrency(price)}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #E5E7EB; text-align: right; font-size: 14px; color: #1F2937;">${lineTotal}</td>
        </tr>
      `;
    }).join('') || `
      <tr>
        <td colspan="5" style="padding: 12px; color: #6B7280; text-align: center;">No product details available.</td>
      </tr>
    `;

    const subtotal = this.formatCurrency(order?.subtotal || 0);
    const deliveryFee = this.formatCurrency(order?.deliveryFee || 0);
    const shippingFee = this.formatCurrency(order?.shippingFee || 0);
    const codFee = this.formatCurrency(order?.codFee || 0);
    const discount = this.formatCurrency(order?.discount || 0);

    const statusMap: Record<string, { title: string; subtitle: string; accent: string; extra?: string }> = {
      Placed: {
        title: 'Your order has been received successfully',
        subtitle: 'We have received your order and it is now being processed.',
        accent: '#16A34A',
        extra: `Order ID: #${orderId}`,
      },
      Accepted: {
        title: 'Your order has been accepted',
        subtitle: 'Your order is confirmed and being prepared for dispatch.',
        accent: '#2563EB',
        extra: `Invoice: ${invoiceUrl ? `<a href="${invoiceUrl}" style="color:#2563EB; text-decoration:none;">View invoice</a>` : 'Will be shared soon'}`,
      },
      Shipped: {
        title: 'Your order has been shipped',
        subtitle: 'Your package is on the way. Track it using the details below.',
        accent: '#7C3AED',
        extra: `Tracking ID: <strong>${trackingId}</strong>${trackingLink ? ` | <a href="${trackingLink}" style="color:#7C3AED; text-decoration:none;">Track shipment</a>` : ''}`,
      },
      Delivered: {
        title: 'Your order has been delivered',
        subtitle: 'We hope you love your purchase. Thank you for shopping with us.',
        accent: '#059669',
        extra: `Invoice: ${invoiceUrl ? `<a href="${invoiceUrl}" style="color:#059669; text-decoration:none;">Download invoice</a>` : 'Included in your order info'}`,
      },
      Cancelled: {
        title: 'Your order has been cancelled',
        subtitle: 'Your order has been successfully cancelled as requested.',
        accent: '#DC2626',
        extra: `Reason: ${cancelRemarks}`,
      },
    };

    const currentStatus = statusMap[status] || {
      title: 'Order update',
      subtitle: 'Your order status has been updated.',
      accent: '#111827',
    };

    return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#F3F4F6; padding:32px 18px;">
        <div style="max-width:760px; margin:0 auto; background:#FFFFFF; border-radius:18px; overflow:hidden; box-shadow:0 10px 30px rgba(15,23,42,0.08); border:1px solid #E5E7EB;">
          <div style="background:${currentStatus.accent}; padding:28px 32px; color:#fff;">
            <div style="font-size:12px; letter-spacing:1.4px; text-transform:uppercase; opacity:0.9;">Ganesh Labels</div>
            <h2 style="margin:12px 0 6px; font-size:30px; line-height:1.2;">${currentStatus.title}</h2>
            <p style="margin:0; font-size:15px; color: rgba(255,255,255,0.9);">${currentStatus.subtitle}</p>
          </div>

          <div style="padding:28px 32px;">
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:22px;">
              <div>
                <div style="font-size:12px; color:#6B7280; text-transform:uppercase; letter-spacing:0.8px;">Customer</div>
                <div style="font-size:18px; font-weight:700; color:#111827; margin-top:6px;">${customerName}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:12px; color:#6B7280; text-transform:uppercase; letter-spacing:0.8px;">Order Number</div>
                <div style="font-size:18px; font-weight:700; color:#111827; margin-top:6px;">#${orderId}</div>
              </div>
            </div>

            <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:12px; padding:16px 18px; margin-bottom:24px;">
              <div style="font-size:12px; color:#6B7280; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:10px;">Order updates</div>
              <div style="font-size:15px; color:#111827; line-height:1.7;">${currentStatus.extra || `Order status: ${status}`}</div>
            </div>

            <div style="margin-bottom:24px;">
              <h3 style="margin:0 0 12px; font-size:18px; color:#111827;">Shipping address</h3>
              <div style="padding:16px; border:1px solid #E5E7EB; border-radius:12px; background:#fff; color:#374151; line-height:1.7; font-size:14px;">${this.getOrderAddress(order)}</div>
            </div>

            <div style="margin-bottom:24px;">
              <h3 style="margin:0 0 12px; font-size:18px; color:#111827;">Product details</h3>
              <table style="width:100%; border-collapse:collapse; background:#fff; border:1px solid #E5E7EB; border-radius:12px; overflow:hidden;">
                <thead>
                  <tr style="background:#F3F4F6;">
                    <th style="padding:12px 10px; text-align:left; font-size:12px; color:#374151; text-transform:uppercase; letter-spacing:0.7px;">Product</th>
                    <th style="padding:12px 10px; text-align:center; font-size:12px; color:#374151; text-transform:uppercase; letter-spacing:0.7px;">Variant</th>
                    <th style="padding:12px 10px; text-align:center; font-size:12px; color:#374151; text-transform:uppercase; letter-spacing:0.7px;">Qty</th>
                    <th style="padding:12px 10px; text-align:right; font-size:12px; color:#374151; text-transform:uppercase; letter-spacing:0.7px;">Price</th>
                    <th style="padding:12px 10px; text-align:right; font-size:12px; color:#374151; text-transform:uppercase; letter-spacing:0.7px;">Total</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>
            </div>

            <div style="margin-top:28px; padding-top:14px; border-top:1px solid #E5E7EB;">
              <h3 style="margin:0 0 12px; font-size:18px; color:#111827;">Payment summary</h3>
              <table style="width:100%; color:#374151; font-size:15px;">
                <tr>
                  <td style="padding:6px 0;">Subtotal</td>
                  <td style="padding:6px 0; text-align:right;">${subtotal}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;">Delivery fee</td>
                  <td style="padding:6px 0; text-align:right;">${deliveryFee}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;">Shipping fee</td>
                  <td style="padding:6px 0; text-align:right;">${shippingFee}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;">COD fee</td>
                  <td style="padding:6px 0; text-align:right;">${codFee}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;">Discount</td>
                  <td style="padding:6px 0; text-align:right;">-${discount}</td>
                </tr>
                <tr style="font-size:18px; font-weight:700; color:#111827;">
                  <td style="padding:12px 0 0;">Total amount</td>
                  <td style="padding:12px 0 0; text-align:right;">${orderTotal}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async sendOrderStatusEmail(order: any, status?: string) {
    const finalStatus = status || order?.status || 'Placed';
    const customerEmail = order?.user?.email || order?.email;

    if (!customerEmail) {
      return;
    }

    const mailOptions = {
      from: `"Ganesh Labels" <${this.email}>`,
      to: customerEmail,
      subject: `Order ${finalStatus} - #${order?.id || 'N/A'}`,
      html: this.getStatusContent(order, finalStatus),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Order status email sent for order #${order?.id} (${finalStatus}) to ${customerEmail}`);
    } catch (error) {
      console.error(`Failed to send order status email for order #${order?.id}:`, error);
    }
  }

  @Cron('0 8 * * *')
  async sendDailyControlStatus() {
    try {
      const hostname = os.hostname();
      const interfaces = os.networkInterfaces();
      let ip = 'Unknown';
      for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; iface && i < iface.length; i++) {
          const alias = iface[i];
          if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
            ip = alias.address;
            break;
          }
        }
      }

      const settings = (await this.prisma.appSettings.findFirst()) as any;
      if (!settings) return;

      const hiddenPages = settings.hiddenPages as any[];
      const maintenanceStatus = settings.maintenanceMode
        ? '🚨 ENABLED - Site Hided'
        : '✅ DISABLED - Site Live';

      const mailOptions = {
        from: `"EN3 Control Center" <${this.email}>`,
        to: this.email,
        subject: `Daily Control Status Report - ${new Date().toLocaleDateString(
          'en-GB',
        )}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 2px solid #333; border-radius: 12px; background-color: #fcfcfc;">
            <h2 style="color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Morning Control Status ☀️</h2>
            <p style="font-size: 11px; color: #777; margin-bottom: 20px;">
              <strong>System Identity:</strong> ${hostname} | <strong>Server IP:</strong> ${ip}
            </p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: ${
              settings.maintenanceMode ? '#fdecea' : '#e6f4ea'
            }; border-radius: 8px;">
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: ${
                settings.maintenanceMode ? '#c62828' : '#2e7d32'
              };">
                Master Kill Switch: ${maintenanceStatus}
              </p>
            </div>

            <h3 style="color: #666; margin-top: 25px;">Granular Page Status:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #eee;">
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Page Name</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${hiddenPages.map(page => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${page.name}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: ${page.isHidden ? '#d32f2f' : '#2e7d32'};">
                      ${page.isHidden ? 'Hided' : 'Live'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
              This is an automated security report from your EN3 Fashions Control Center.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Daily Control Status email sent to admin.');
    } catch (error) {
      console.error('Error sending daily control status email:', error);
    }
  }
}
