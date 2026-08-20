import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { IndianState } from '@prisma/client'

@Controller('shipping')
export class ShippingController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.shippingRule.findMany()
  }

  @Post()
  create(@Body() createShippingDto: { state: string; flatShippingRate: number; codAvailable?: boolean }) {
    return this.prisma.shippingRule.create({
      data: {
        state: createShippingDto.state.toUpperCase().replace(/ /g, '_').replace(/and/g, '').replace(/__/g, '_') as IndianState,
        flatShippingRate: createShippingDto.flatShippingRate,
        codAvailable: createShippingDto.codAvailable ?? true
      }
    })
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateShippingDto: { state: string; flatShippingRate: number; codAvailable?: boolean }) {
    return this.prisma.shippingRule.update({
      where: { id: +id },
      data: {
        state: updateShippingDto.state.toUpperCase().replace(/ /g, '_').replace(/and/g, '').replace(/__/g, '_') as IndianState,
        flatShippingRate: updateShippingDto.flatShippingRate,
        codAvailable: updateShippingDto.codAvailable ?? true
      }
    })
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.shippingRule.delete({
      where: { id: +id }
    })
  }
}