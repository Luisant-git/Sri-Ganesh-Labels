import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(userId: number, addToCartDto: AddToCartDto) {
    // Get or create cart for user
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true }
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: true }
      });
    }

    // Extract product ID for single items
    const productId = addToCartDto.type === 'bundle' ? null : 
      (typeof addToCartDto.id === 'number' ? addToCartDto.id : parseInt(addToCartDto.id || '0'));

    // Check if item already exists in cart
    const existingItem = cart.items.find(item => {
      if (addToCartDto.type === 'bundle') {
        return false; // Bundles are always added as new items
      }
      return item.productId === productId && 
             item.size === addToCartDto.size && 
             item.color === addToCartDto.color;
    });

    if (existingItem) {
      // Validate stock for existing item increment
      if (productId) {
        await this.validateStock(productId as number, addToCartDto.color || '', addToCartDto.size || '', existingItem.quantity + (addToCartDto.quantity || 1));
      }

      // Update quantity and sizeVariantId for existing item
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { 
          quantity: existingItem.quantity + (addToCartDto.quantity || 1),
          sizeVariantId: addToCartDto.sizeVariantId
        }
      });
    }

    // Validate stock for new item
    if (productId && addToCartDto.type !== 'bundle') {
      await this.validateStock(productId as number, addToCartDto.color || '', addToCartDto.size || '', (addToCartDto.quantity || 1));
    }
    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        name: addToCartDto.name,
        price: addToCartDto.price,
        imageUrl: addToCartDto.imageUrl,
        size: addToCartDto.size,
        color: addToCartDto.color,
        sizeVariantId: addToCartDto.sizeVariantId,
        quantity: addToCartDto.quantity || 1,
        type: addToCartDto.type || 'single',
        bundleItems: addToCartDto.items ? JSON.parse(JSON.stringify(addToCartDto.items)) : undefined,
        hsnCode: addToCartDto.hsnCode
      }
    });
  }

  async getCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true }
    });

    return cart?.items || [];
  }

  async removeFromCart(userId: number, itemId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) return null;

    return this.prisma.cartItem.delete({
      where: { 
        id: itemId,
        cartId: cart.id 
      }
    });
  }

  async updateQuantity(userId: number, itemId: number, quantity: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) return null;

    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId }
    });

    if (item && item.productId && item.type !== 'bundle') {
      await this.validateStock(item.productId, item.color || '', item.size || '', quantity);
    }

    return this.prisma.cartItem.update({
      where: { 
        id: itemId,
        cartId: cart.id 
      },
      data: { quantity }
    });
  }

  private async validateStock(productId: number, colorName: string, sizeName: string, requestedQty: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || !product.colors) return;

    const colors = product.colors as any[];
    const color = colors.find(c => c.name === colorName);
    if (!color) return;

    const size = color.sizes?.find(s => s.size === sizeName);
    if (!size) return;

    const availableQty = parseInt(size.quantity || '0');
    if (requestedQty > availableQty) {
      throw new BadRequestException(`Only ${availableQty} units available for this variant.`);
    }
  }

  async clearCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) return null;

    return this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });
  }
}