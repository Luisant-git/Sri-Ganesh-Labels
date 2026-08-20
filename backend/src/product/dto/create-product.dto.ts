import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';

class GalleryDto {
  @ApiProperty({ example: 'https://cdn/img/p1-1.jpg' })
  url: string;
}

export { GalleryDto };

export class CreateProductDto {
  @ApiProperty({ example: 'Classic Cotton T-Shirt' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '100% cotton' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ example: '499.00' })
  @IsString()
  basePrice: string;

  @ApiPropertyOptional({ example: '599.00' })
  @IsOptional()
  @IsString()
  mrp?: string;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsNumber()
  gstPercentage?: number;

  @ApiPropertyOptional({ example: '6109' })
  @IsOptional()
  @IsString()
  hsnCode?: string;

  @ApiPropertyOptional({ type: [GalleryDto] })
  @IsOptional()
  @IsArray()
  gallery?: GalleryDto[];

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  newArrivals?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  discount?: boolean;
}