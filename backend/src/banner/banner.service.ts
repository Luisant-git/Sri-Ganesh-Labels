import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  create(createBannerDto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: createBannerDto,
    });
  }

  findAll() {
    return this.prisma.banner.findMany({
      orderBy: { createAt: 'desc' }
    });
  }

  findAllActive() {
    return this.prisma.banner.findMany({
      where: {
        isActive: true,
        rowNumber: {
          gt: 0,
        },
      },
      orderBy: {
        rowNumber: 'asc'
      }
    });
  }

  findOne(id: number) {
    return this.prisma.banner.findUnique({
      where: { id },
    });
  }

  update(id: number, updateBannerDto: UpdateBannerDto) {
    return this.prisma.banner.update({
      where: { id },
      data: updateBannerDto,
    });
  }

  remove(id: number) {
    return this.prisma.banner.delete({
      where: { id },
    });
  }
}

