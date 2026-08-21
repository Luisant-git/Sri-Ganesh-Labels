import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        gallery: createProductDto.gallery as any,
        quantityPrices: (createProductDto.quantityPrices ?? []) as any,
      },
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findAllActive() {
    return this.prisma.product.findMany({
      where: {
        status: 'active',
      },
      include: {
        category: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    const { id: _, createdAt, updatedAt, category, ...data } = updateProductDto as any;
    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        gallery: data.gallery as any,
        ...(data.quantityPrices !== undefined ? { quantityPrices: data.quantityPrices as any } : {}),
      },
    });
  }

  remove(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async search(query: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const products = await this.prisma.product.findMany({
      where: {
        status: 'active',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { category: true },
      take: 10,
    });

    return products.map(product => {
      const firstGallery = product.gallery[0] as any;
      return {
        id: product.id,
        name: product.name,
        price: product.basePrice,
        image: firstGallery?.url,
      };
    });
  }

  async getStorefrontProducts() {
    const products = await this.prisma.product.findMany({
      where: { status: 'active' },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return products.map(product => this.serializeForStorefront(product));
  }

  async getStorefrontProduct(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product || product.status !== 'active') {
      return null;
    }
    return this.serializeForStorefront(product);
  }

  private serializeForStorefront(product: any) {
    const basePrice = parseFloat(product.basePrice || '0');
    const gstPercentage = product.gstPercentage || 0;
    const gstAmount = parseFloat(((basePrice * gstPercentage) / 100).toFixed(2));
    const totalValue = parseFloat((basePrice + gstAmount).toFixed(2));
    const gallery = (product.gallery || []) as any[];

    const quantityPrices = ((product.quantityPrices as any[]) || [])
      .map((t: any) => {
        const qty = parseInt(t?.quantity, 10);
        const rate = parseFloat(t?.price);
        if (!qty || qty < 1 || isNaN(rate) || rate < 0) return null;
        const tierGst = parseFloat(((rate * gstPercentage) / 100).toFixed(2));
        return {
          quantity: qty,
          price: rate,
          gstAmount: tierGst,
          totalValue: parseFloat((rate + tierGst).toFixed(2)),
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.quantity - b.quantity);

    return {
      id: product.id,
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId,
      category: product.category?.name || null,
      basePrice: product.basePrice,
      mrp: product.mrp || null,
      gstPercentage,
      gstAmount,
      totalValue,
      price: totalValue,
      originalPrice: product.mrp ? parseFloat(product.mrp) : null,
      hsnCode: product.hsnCode || null,
      gallery: gallery.map((g: any) => g.url),
      image: gallery[0]?.url || null,
      quantityPrices,
      status: product.status,
      newArrivals: product.newArrivals,
      discount: product.discount,
      options: [],
      stock: 999,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}