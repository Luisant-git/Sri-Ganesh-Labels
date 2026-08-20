import { IsString, IsOptional, IsArray, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BundleItemDto {
  @IsString()
  color: string;

  @IsString()
  size: string;

  @IsString()
  originalPrice: string;

  @IsString()
  colorImage: string;
}

export class AddToCartDto {
  @IsOptional()
  id?: number | string;

  @IsString()
  name: string;

  @IsString()
  price: string;

  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  sizeVariantId?: string;

  @IsOptional()
  @IsInt()
  quantity?: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  items?: BundleItemDto[];

  @IsOptional()
  @IsString()
  hsnCode?: string;
}