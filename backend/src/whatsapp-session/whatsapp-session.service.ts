import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WhatsappSessionService {
  constructor(private prisma: PrismaService) {}

  async handleInteractiveMenu(phone: string, input: string, sendMessageFn: (to: string, msg: string, imageUrl?: string) => Promise<any>) {
    const session = await this.prisma.whatsappSession.upsert({
      where: { phone },
      create: { phone, state: 'menu' },
      update: {}
    });

    const trimmedInput = input.trim();

    if (trimmedInput.toLowerCase() === 'menu' || trimmedInput === '0' || trimmedInput.toLowerCase() === 'hi' || trimmedInput.toLowerCase() === 'hello' || trimmedInput.toLowerCase() === 'start' || trimmedInput.toLowerCase() === 'restart') {
      await this.prisma.whatsappSession.update({
        where: { phone },
        data: { state: 'menu', categoryId: null, subCategoryId: null }
      });
      await this.sendCategoryMenu(phone, sendMessageFn);
      return;
    }

    switch (session.state) {
      case 'menu':
        await this.handleCategorySelection(phone, trimmedInput, sendMessageFn);
        break;
      case 'category':
        if (session.categoryId) {
          await this.handleSubCategorySelection(phone, trimmedInput, session.categoryId, sendMessageFn);
        }
        break;
      case 'subcategory':
        if (session.subCategoryId) {
          await this.handleProductSelection(phone, trimmedInput, session.subCategoryId, sendMessageFn);
        }
        break;
    }
  }

  async sendCategoryMenu(phone: string, sendMessageFn: (to: string, msg: string, imageUrl?: string) => Promise<any>) {
    const categories = await this.prisma.category.findMany({ orderBy: { id: 'asc' } });
    let message = '🛍️ *Welcome to EN3 Fashions!*\n\nSelect a category:\n\n';
    categories.forEach(cat => {
      message += `${cat.id}. ${cat.name}\n`;
    });
    message += '\n0. Main Menu';
    await sendMessageFn(phone, message);
  }

  async handleCategorySelection(phone: string, input: string, sendMessageFn: (to: string, msg: string, imageUrl?: string) => Promise<any>) {
    const categoryId = parseInt(input);
    if (isNaN(categoryId)) {
      return;
    }

    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return;
    }

    await this.prisma.whatsappSession.update({
      where: { phone },
      data: { state: 'category', categoryId }
    });

    const subCategories = await this.prisma.subCategory.findMany({
      where: { categoryId },
      orderBy: { id: 'asc' }
    });

    let message = `📂 *${category.name}*\n\nSelect a subcategory:\n\n`;
    subCategories.forEach(sub => {
      message += `${sub.id}. ${sub.name}\n`;
    });
    message += '\n0. Main Menu';
    await sendMessageFn(phone, message);
  }

  async handleSubCategorySelection(phone: string, input: string, categoryId: number, sendMessageFn: (to: string, msg: string, imageUrl?: string) => Promise<any>) {
    const subCategoryId = parseInt(input);
    if (isNaN(subCategoryId)) {
      return;
    }

    const subCategory = await this.prisma.subCategory.findFirst({
      where: { id: subCategoryId, categoryId }
    });

    if (!subCategory) {
      return;
    }

    await this.prisma.whatsappSession.update({
      where: { phone },
      data: { state: 'subcategory', subCategoryId }
    });

    const products = await this.prisma.product.findMany({
      where: { subCategoryId, status: 'active' },
      orderBy: { id: 'asc' },
      take: 20
    });

    let message = `🏷️ *${subCategory.name}*\n\nSelect a product:\n\n`;
    products.forEach(prod => {
      message += `${prod.id}. ${prod.name} - Rs.${prod.basePrice}\n`;
    });
    message += '\n0. Main Menu';
    await sendMessageFn(phone, message);
  }

  async handleProductSelection(phone: string, input: string, subCategoryId: number, sendMessageFn: (to: string, msg: string, imageUrl?: string) => Promise<any>) {
    const productId = parseInt(input);
    if (isNaN(productId)) {
      return;
    }

    const product = await this.prisma.product.findFirst({
      where: { id: productId, subCategoryId },
      include: { category: true, subCategory: true }
    });

    if (!product) {
      return;
    }

    let message = `✨ *${product.name}*\n\n`;
    message += `💰 Price: Rs.${product.basePrice}\n`;
    if (product.description) message += `📝 ${product.description}\n`;
    message += `\n🔗 View: ${process.env.FRONTEND_URL}/product/${product.id}\n`;
    message += '\nType "menu" or "0" to go back to main menu';

    const gallery = product.gallery as any;
    const colors = product.colors as any;
    const imageUrl = gallery?.[0]?.url || colors?.[0]?.image;
    await sendMessageFn(phone, message, imageUrl);
  }

  async getSession(phone: string) {
    return this.prisma.whatsappSession.findUnique({ where: { phone } });
  }
}
