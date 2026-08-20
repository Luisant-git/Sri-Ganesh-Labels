import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateSubCategoryDto {
  @ApiProperty({ example: 'T-Shirts' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  categoryId: number;

  @ApiPropertyOptional({ example: 'Casual and formal t-shirts' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '/uploads/tshirt-subcategory.png' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: '/uploads/size-chart.png' })
  @IsOptional()
  @IsString()
  sizeChart?: string;
}