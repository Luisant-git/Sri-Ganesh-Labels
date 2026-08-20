import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Nike' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Just Do It - Leading sportswear brand' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '/uploads/nike-logo.png' })
  @IsOptional()
  @IsString()
  image?: string;
}