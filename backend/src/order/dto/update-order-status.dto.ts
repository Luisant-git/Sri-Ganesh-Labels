import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'Processing', enum: ['Pending', 'Processing', 'Accepted', 'Shipped', 'Delivered', 'Cancelled', 'CODReturn'] })
  @IsString()
  status: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  invoiceUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  packageSlipUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  courierName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  trackingId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  trackingLink?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cancelRemarks?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  codReturnRemarks?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  chargedWeight?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  codCharge?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  courierCharge?: number;
}
