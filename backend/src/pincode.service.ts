import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreatePincodeDto } from './create-pincode.dto';
import { UpdatePincodeDto } from './update-pincode.dto';
import { IndianState } from '@prisma/client';

function normalizeState(value: string): string {
  const raw = (value || '').trim();
  if (!raw) return '';

  const compact = raw
    .toUpperCase()
    .replace(/&/g, ' AND ')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const aliases: Record<string, string> = {
    'ANDAMAN AND NICOBAR ISLANDS': 'ANDAMAN_NICOBAR',
    'DADRA AND NAGAR HAVELI AND DAMAN AND DIU': 'DADRA_NAGAR_HAVELI',
  };

  if (aliases[compact]) return aliases[compact];

  return compact
    .replace(/\s+AND\s+/gi, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_ISLANDS$/g, '')
    .replace(/_CITY$/g, '');
}

@Injectable()
export class PincodeService {
  constructor(private prisma: PrismaService) {}

  create(createPincodeDto: CreatePincodeDto) {
    return this.prisma.pincode.create({
      data: {
        ...createPincodeDto,
        state: normalizeState(createPincodeDto.state) as IndianState,
      },
    });
  }

  findAll() {
    return this.prisma.pincode.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.pincode.findUnique({
      where: { id },
    });
  }

  update(id: number, updatePincodeDto: UpdatePincodeDto) {
    const data: any = { ...updatePincodeDto };
    if (updatePincodeDto.state) {
      data.state = normalizeState(updatePincodeDto.state) as IndianState;
    }
    return this.prisma.pincode.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.pincode.delete({
      where: { id },
    });
  }
}
