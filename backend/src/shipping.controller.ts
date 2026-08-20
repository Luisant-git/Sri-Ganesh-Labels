import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { IndianState } from '@prisma/client'

function normalizeState(value: string): string {
  return (value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '')
    .replace(/_AND_/g, '_')
    .replace(/^AND_/, '')
    .replace(/_AND$/, '')
}

@Controller('shipping')
export class ShippingController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.shippingRule.findMany()
  }

  @Post('calculate')
  async calculate(@Body() body: { state?: string; subtotal?: number }) {
    const subtotal = Number(body?.subtotal || 0)
    const rawState = (body?.state || '').trim()
    const normalized = normalizeState(rawState)
    const [settings, rules] = await Promise.all([
      this.prisma.appSettings.findFirst(),
      this.prisma.shippingRule.findMany(),
    ])
    const freeShippingThreshold = Number(settings?.freeShippingThreshold || 0)
    const defaultFee = Number(settings?.shippingFee || 0)

    const rule = normalized
      ? rules.find((r) => r.state === normalized || normalizeState(r.state) === normalized)
      : undefined

    const baseFee = rule ? Number(rule.flatShippingRate) : defaultFee
    const isFreeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold
    const shippingFee = isFreeShipping ? 0 : baseFee
    const remainingForFree = freeShippingThreshold > 0 ? Math.max(0, freeShippingThreshold - subtotal) : 0

    return {
      state: rawState,
      baseFee,
      shippingFee,
      isFreeShipping,
      remainingForFree,
      freeShippingThreshold,
      ruleApplied: !!rule,
      codAvailable: rule ? rule.codAvailable : true,
    }
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