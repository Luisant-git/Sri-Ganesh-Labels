import { PartialType } from '@nestjs/swagger';
import { CreateSubCategoryDto } from './create-subcategory.dto';
import { IsOptional, IsArray, IsObject } from 'class-validator';

export class UpdateSubCategoryDto extends PartialType(CreateSubCategoryDto) {
  @IsOptional()
  @IsObject()
  category?: any;

  @IsOptional()
  @IsArray()
  products?: any[];
}
