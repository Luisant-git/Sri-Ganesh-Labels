import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Clothing' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Fashion and apparel items' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '/uploads/clothing-category.png' })
  @IsOptional()
  @IsString()
  image?: string;
}