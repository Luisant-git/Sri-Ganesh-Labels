import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class GalleryDto {
  @ApiProperty({ example: 'https://cdn/img/p1-1.jpg' })
  url: string;
}

export { GalleryDto };

export class QuantityPriceDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: '499.00' })
  @IsString()
  price: string;
}

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

  @ApiPropertyOptional({ type: [QuantityPriceDto], description: 'Quantity-based price tiers' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuantityPriceDto)
  quantityPrices?: QuantityPriceDto[];

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