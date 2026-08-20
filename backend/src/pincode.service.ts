import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreatePincodeDto } from './create-pincode.dto';
import { UpdatePincodeDto } from './update-pincode.dto';
import { IndianState } from '@prisma/client';

@Injectable()
export class PincodeService {
  constructor(private prisma: PrismaService) {}

  create(createPincodeDto: CreatePincodeDto) {
    return this.prisma.pincode.create({
      data: {
        ...createPincodeDto,
        state: createPincodeDto.state.toUpperCase().replace(/ /g, '_').replace(/and/g, '').replace(/__/g, '_') as IndianState,
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
      data.state = updatePincodeDto.state.toUpperCase().replace(/ /g, '_').replace(/and/g, '').replace(/__/g, '_') as IndianState;
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
