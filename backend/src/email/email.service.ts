import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import * as os from 'os';

@Injectable()
export class EmailService {
  private transporter;
  private readonly email = 'naveenv0906@gmail.com';
  private readonly password = 'dgon uztz wxlp suug';

  constructor(private prisma: PrismaService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.email,
        pass: this.password,
      },
    });
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
