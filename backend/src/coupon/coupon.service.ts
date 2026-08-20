import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  async create(createCouponDto: CreateCouponDto) {
    const { specificUserIds, ...rest } = createCouponDto;
    const data: any = {
      ...rest,
      code: rest.code.toUpperCase(),
    };
    if (specificUserIds && specificUserIds.length > 0) {
      data.specificUsers = {
        connect: specificUserIds.map((id) => ({ id })),
      };
    }
    return this.prisma.coupon.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.coupon.findMany({
      include: { 
        usages: true,
        specificUsers: {
          select: { id: true, name: true, phone: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.coupon.findUnique({
      where: { id },
      include: { usages: true, specificUsers: { select: { id: true, name: true, phone: true, email: true } } },
    });
  }

  async update(id: number, updateData: Partial<CreateCouponDto>) {
    const { specificUserIds, ...rest } = updateData;
    const data: any = { ...rest };
    if (data.code) {
      data.code = data.code.toUpperCase();
    }
    if (specificUserIds !== undefined) {
      data.specificUsers = {
        set: specificUserIds.map((userId) => ({ id: userId })),
      };
    }
    return this.prisma.coupon.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.coupon.delete({ where: { id } });
  }

  async validateCoupon(
    code: string,
    userId: number,
    subtotal: number,
    deliveryFee: number = 0,
    codFee: number = 0,
    cartItems?: Array<{ productId?: number; price: number; quantity: number }>
  ) {
    const coupon = await (this.prisma.coupon as any).findUnique({
      where: { code: code.toUpperCase() },
      include: { 
        usages: { where: { userId } },
        specificUsers: true 
      },
    });

    if (!coupon) {
      throw new BadRequestException('Invalid coupon code');
    }

    if (coupon.specificUsers && coupon.specificUsers.length > 0) {
      if (!coupon.specificUsers.some(u => u.id === userId)) {
        throw new BadRequestException('This coupon is not available for your account');
      }
    }

    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is inactive');
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (coupon.usages.length >= coupon.perUserLimit) {
      throw new BadRequestException('You have already used this coupon');
    }

    if (subtotal < coupon.minOrderAmount) {
      throw new BadRequestException(`Minimum order amount is ₹${coupon.minOrderAmount}`);
    }

    // -- Handle excludeOfferProducts --
    let eligibleSubtotal = subtotal;
    if (coupon.excludeOfferProducts && cartItems && cartItems.length > 0) {
      let offerProductsTotal = 0;
      let allItemsAreOffer = true;

      for (const item of cartItems) {
        if (!item.productId) continue;
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { discount: true },
        });
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        if (product?.discount) {
          offerProductsTotal += itemTotal;
        } else {
          allItemsAreOffer = false;
        }
      }

      if (allItemsAreOffer && offerProductsTotal > 0) {
        throw new BadRequestException('This coupon is not applicable for offer products.');
      }

      eligibleSubtotal = Math.max(0, subtotal - offerProductsTotal);
    }

    const targets = coupon.applyTo || ['subtotal'];
    const totalTargetAmount = targets.reduce((sum, target) => {
      if (target === 'subtotal') return sum + eligibleSubtotal;
      if (target === 'delivery') return sum + deliveryFee;
      if (target === 'cod') return sum + codFee;
      return sum;
    }, 0);

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (totalTargetAmount * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    // Ensure the discount does not exceed the total targeted amount
    discount = Math.min(discount, totalTargetAmount);

    return { coupon, discount };
  }

  async applyCoupon(couponId: number, userId: number) {
    await this.prisma.$transaction([
      this.prisma.couponUsage.create({
        data: { userId, couponId },
      }),
      this.prisma.coupon.update({
        where: { id: couponId },
        data: { usageCount: { increment: 1 } },
      }),
    ]);
  }

  async getActiveCoupons(userId?: number) {
    const whereCondition: any = {
      isActive: true,
      isHiddenFromUser: false,
      OR: [
        { expiryDate: null },
        { expiryDate: { gte: new Date() } },
      ],
    };

    if (userId) {
      whereCondition.AND = [
        {
          OR: [
            { specificUsers: { none: {} } },
            { specificUsers: { some: { id: userId } } },
          ],
        },
      ];
    } else {
      whereCondition.specificUsers = { none: {} };
    }

    const coupons = await this.prisma.coupon.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
    });

    return coupons.map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount,
    }));
  }
}
