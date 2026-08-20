import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { EmailService } from './email.service';
import { simpleParser } from 'mailparser';
const Imap = require('imap');

@Injectable()
export class EmailControlService implements OnModuleInit {
  private readonly userEmail = 'naveenv0906@gmail.com';
  private readonly password = 'dgon uztz wxlp suug';

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  onModuleInit() {
    this.pollForCommands();
  }

  @Cron('*/5 * * * *')
  async pollForCommands() {
    const imap = new Imap({
      user: this.userEmail,
      password: this.password,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err) => {
        if (err) return imap.end();
        
        imap.search(['UNSEEN', ['FROM', this.userEmail]], (err, results) => {
          if (err || !results || results.length === 0) return imap.end();

          const f = imap.fetch(results, { bodies: '', markSeen: true });
          f.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream, async (err, parsed) => {
                const command = (parsed.subject || parsed.text || '').toUpperCase();
                console.log('Received Email Command:', command);
                await this.processCommand(command);
              });
            });
          });
          f.once('end', () => imap.end());
        });
      });
    });

    imap.once('error', (err) => {
      if (err.message.includes('AUTHENTICATIONFAILED')) {
        console.warn('⚠️ [Email Control] Gmail Authentication Failed. Please check your App Password.');
      } else {
        // console.error('❌ [Email Control] IMAP Error:', err.message);
      }
    });
    
    try {
      imap.connect();
    } catch (e) {
      // console.error('❌ [Email Control] Connection Error:', e.message);
    }
  }

  async processCommand(command: string) {
    const settings = await this.prisma.appSettings.findFirst() as any;
    if (!settings) return;

    let updateData: any = {};
    let hiddenPages = Array.isArray(settings.hiddenPages) ? settings.hiddenPages : [];
    
    const corePages = [
      { name: 'Home', path: '/' },
      { name: 'Cart', path: '/cart' },
      { name: 'Checkout', path: '/checkout' },
      { name: 'Profile', path: '/profile' },
      { name: 'Wishlist', path: '/wishlist' },
      { name: 'Orders', path: '/orders' },
      { name: 'Product', path: '/product' },
      { name: 'Search', path: '/search' }
    ];

    corePages.forEach(({ name, path }) => {
      if (!hiddenPages.some(p => p.path === path)) {
        hiddenPages.push({ name, path, isHidden: false });
      }
    });

    if (command.includes('MASTER ON')) {
      updateData.maintenanceMode = true;
    } else if (command.includes('MASTER OFF')) {
      updateData.maintenanceMode = false;
    } else if (command.includes('HIDE')) {
      const target = command.split('HIDE')[1]?.trim();
      hiddenPages = hiddenPages.map(p => {
        if (target === 'ALL' || p.name.toUpperCase() === target || p.path.toUpperCase() === '/' + target) {
          return { ...p, isHidden: true };
        }
        return p;
      });
      updateData.hiddenPages = hiddenPages;
    } else if (command.includes('SHOW')) {
      const target = command.split('SHOW')[1]?.trim();
      hiddenPages = hiddenPages.map(p => {
        if (target === 'ALL' || p.name.toUpperCase() === target || p.path.toUpperCase() === '/' + target) {
          return { ...p, isHidden: false };
        }
        return p;
      });
      updateData.hiddenPages = hiddenPages;
    } else if (command.includes('RESET')) {
      updateData.maintenanceMode = false;
      updateData.hiddenPages = hiddenPages.map(p => ({ ...p, isHidden: false }));
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.appSettings.update({
        where: { id: settings.id },
        data: updateData
      });
    }
  }
}
