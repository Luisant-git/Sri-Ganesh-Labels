import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-auth.guard';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get('active')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active coupons (optionally filtered by user)', description: 'Returns general coupons for all users. If authenticated, also returns user-specific coupons.' })
  @ApiResponse({ status: 200, description: 'Returns active coupons' })
  getActiveCoupons(@Request() req) {
    const userId = req.user?.userId;
    return this.couponService.getActiveCoupons(userId);
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate coupon code' })
  @ApiBody({ schema: { properties: { code: { type: 'string' }, subtotal: { type: 'number' }, deliveryFee: { type: 'number' }, codFee: { type: 'number' } } } })
  @ApiResponse({ status: 200, description: 'Coupon validated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid coupon' })
  validate(@Request() req, @Body() body: { code: string; subtotal: number; deliveryFee?: number; codFee?: number; cartItems?: Array<{ productId?: number; price: number; quantity: number }> }) {
    return this.couponService.validateCoupon(body.code, req.user.userId, body.subtotal, body.deliveryFee || 0, body.codFee || 0, body.cartItems);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new coupon (Admin)' })
  @ApiResponse({ status: 201, description: 'Coupon created successfully' })
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all coupons (Admin)' })
  @ApiResponse({ status: 200, description: 'Returns all coupons' })
  findAll() {
    return this.couponService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get coupon by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Returns coupon details' })
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update coupon (Admin)' })
  @ApiResponse({ status: 200, description: 'Coupon updated successfully' })
  update(@Param('id') id: string, @Body() updateData: Partial<CreateCouponDto>) {
    return this.couponService.update(+id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete coupon (Admin)' })
  @ApiResponse({ status: 200, description: 'Coupon deleted successfully' })
  remove(@Param('id') id: string) {
    return this.couponService.remove(+id);
  }
}
