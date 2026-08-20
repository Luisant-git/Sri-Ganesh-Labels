import { IsString, IsObject, IsArray, ValidateNested, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
] as const;

class ShippingAddressDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  addressLine1: string;

  @ApiProperty({ example: 'Apt 4B', required: false })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ example: 'Near Park', required: false })
  @IsString()
  @IsOptional()
  landmark?: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Maharashtra', enum: INDIAN_STATES })
  @IsIn(INDIAN_STATES, { message: 'Invalid state. Please select a valid Indian state.' })
  state: string;

  @ApiProperty({ example: '400001' })
  @IsString()
  pincode: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  mobile: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: '1497.00' })
  @IsString()
  subtotal: string;

  @ApiProperty({ example: '50.00' })
  @IsString()
  deliveryFee: string;

  @ApiProperty({ example: '0.00', required: false })
  @IsOptional()
  @IsString()
  shippingFee?: string;

  @ApiProperty({ example: '35.00', required: false })
  @IsOptional()
  @IsString()
  codFee?: string;

  @ApiProperty({ example: '1547.00' })
  @IsString()
  total: string;

  @ApiProperty({ example: 'SAVE20', required: false })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ example: 'card', enum: ['card', 'upi', 'cod'] })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ type: ShippingAddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty({ example: { fee: 50, name: 'Standard Delivery', duration: '3-5 days' } })
  @IsObject()
  deliveryOption: any;
}