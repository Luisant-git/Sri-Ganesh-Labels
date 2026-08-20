import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';

class GalleryDto {
  @ApiProperty({ example: 'https://cdn/img/p1-1.jpg' })
  url: string;
}

class SizeDto {
  @ApiProperty({ example: 'S' })
  size: string;

  @ApiProperty({ example: '499.00' })
  price: string;

  @ApiProperty({ example: 10 })
  quantity: number;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  sizeVariantId?: string;
}

class ColorDto {
  @ApiProperty({ example: 'Red' })
  name: string;

  @ApiProperty({ example: '#E53935' })
  code: string;

  @ApiPropertyOptional({ example: 'https://cdn/img/red-1.jpg' })
  image?: string;

  @ApiProperty({ type: [SizeDto] })
  sizes: SizeDto[];
}

export { GalleryDto, SizeDto, ColorDto };

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

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  subCategoryId?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  brandId?: number;

  @ApiProperty({ example: '499.00' })
  @IsString()
  basePrice: string;

  @ApiPropertyOptional({ example: '599.00' })
  @IsOptional()
  @IsString()
  mrp?: string;

  @ApiPropertyOptional({ example: '6109' })
  @IsOptional()
  @IsString()
  hsnCode?: string;

  @ApiPropertyOptional({ example: [{ colorCount: 2, price: '800' }, { colorCount: 3, price: '1000' }] })
  @IsOptional()
  @IsArray()
  bundleOffers?: any[];

  @ApiPropertyOptional({ example: ['tshirt', 'men'] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ type: [GalleryDto] })
  @IsOptional()
  @IsArray()
  gallery?: GalleryDto[];

  @ApiProperty({ type: [ColorDto] })
  @IsArray()
  colors: ColorDto[];

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