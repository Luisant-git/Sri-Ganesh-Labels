import { IsString, IsNumber, IsBoolean, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePincodeDto {
  @ApiProperty({ example: '110001' })
  @IsString()
  @Length(6, 6)
  pincode: string;

  @ApiProperty({ example: 'New Delhi' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Delhi' })
  @IsString()
  state: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  deliveryCharge?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  deliveryTime?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  minOrderAmount?: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  codAvailable: boolean;

  @ApiProperty({ example: 'active' })
  @IsString()
  status: string;
}
