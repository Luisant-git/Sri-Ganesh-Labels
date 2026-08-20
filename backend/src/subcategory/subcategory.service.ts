import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';

@Injectable()
export class SubCategoryService {
  constructor(private prisma: PrismaService) {}

  create(createSubCategoryDto: CreateSubCategoryDto) {
    return this.prisma.subCategory.create({
      data: createSubCategoryDto,
      include: {
        category: true,
      },
    });
  }

  findAll() {
    return this.prisma.subCategory.findMany({
      include: {
        category: true,
      },
      orderBy: { orderNumber: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.subCategory.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  update(id: number, updateSubCategoryDto: UpdateSubCategoryDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { category, products, ...subCategoryData } = updateSubCategoryDto;

    return this.prisma.subCategory.update({
      where: { id },
      data: subCategoryData,
      include: {
        category: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.subCategory.delete({
      where: { id },
    });
  }
}
