import { IsString, IsBoolean, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSizeChartDto {
  @ApiPropertyOptional({ description: 'Chart title', example: 'Polo Tshirt Chart' })
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ description: 'Chart image URL', example: 'https://example.com/chart-size.jpg' })
  @IsString()
  image: string;

  @ApiPropertyOptional({ description: 'Is chart active', example: true })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Chart display order', example: 1, minimum: 0 })
  @IsInt()
  @IsOptional()
  rowNumber: number;
}
