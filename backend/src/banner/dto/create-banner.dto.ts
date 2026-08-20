import { IsString, IsBoolean, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBannerDto {
  @ApiPropertyOptional({ description: 'Banner title', example: 'Summer Sale Banner' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Banner link URL', example: 'https://example.com/sale' })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiPropertyOptional({ description: 'Banner active status', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Banner image URL', example: 'https://example.com/banner.jpg' })
  @IsString()
  image: string;

  @ApiPropertyOptional({ description: 'Mobile banner image URL', example: 'https://example.com/mobile-banner.jpg' })
  @IsString()
  @IsOptional()
  mobileImage?: string;

  @ApiPropertyOptional({ description: 'Banner display order', example: 1, minimum: 1 })
  @IsInt()
  @IsOptional()
  rowNumber?: number;
}
