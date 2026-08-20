import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  findAll() {
    return this.prisma.category.findMany({
      include: {
        subCategories: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        subCategories: true,
      },
    });
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { subCategories, ...categoryData } = updateCategoryDto;

    return this.prisma.category.update({
      where: { id },
      data: categoryData,
      include: {
        subCategories: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
