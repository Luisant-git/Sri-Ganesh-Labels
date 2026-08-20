import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCourierPartnerDto } from './dto/create-courier-partner.dto';
import { UpdateCourierPartnerDto } from './dto/update-courier-partner.dto';

@Injectable()
export class CourierPartnerService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateCourierPartnerDto) {
    return this.prisma.courierPartner.create({ data: dto });
  }

  findAll() {
    return this.prisma.courierPartner.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: number) {
    return this.prisma.courierPartner.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateCourierPartnerDto) {
    return this.prisma.courierPartner.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.courierPartner.delete({ where: { id } });
  }
}
