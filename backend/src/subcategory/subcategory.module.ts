import { Module } from '@nestjs/common';
import { SubCategoryService } from './subcategory.service';
import { SubCategoryController } from './subcategory.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SubCategoryController],
  providers: [SubCategoryService, PrismaService],
})
export class SubCategoryModule {}