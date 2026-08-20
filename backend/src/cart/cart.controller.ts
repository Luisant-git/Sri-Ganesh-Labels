import { Controller, Post, Get, Delete, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, addToCartDto);
  }

  @Get()
  async getCart(@Request() req) {
    return this.cartService.getCart(req.user.userId);
  }

  @Delete(':itemId')
  async removeFromCart(@Request() req, @Param('itemId') itemId: string) {
    return this.cartService.removeFromCart(req.user.userId, parseInt(itemId));
  }

  @Patch(':itemId/quantity')
  async updateQuantity(
    @Request() req, 
    @Param('itemId') itemId: string, 
    @Body('quantity') quantity: number
  ) {
    return this.cartService.updateQuantity(req.user.userId, parseInt(itemId), quantity);
  }

  @Delete()
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.userId);
  }
}