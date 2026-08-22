import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { IndianState } from '@prisma/client'

function normalizeState(value: string): string {
  const raw = (value || '').trim()
  if (!raw) return ''

  const compact = raw
    .toUpperCase()
    .replace(/&/g, ' AND ')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const aliases: Record<string, string> = {
    'ANDAMAN AND NICOBAR ISLANDS': 'ANDAMAN_NICOBAR',
    'DADRA AND NAGAR HAVELI AND DAMAN AND DIU': 'DADRA_NAGAR_HAVELI',
  }

  if (aliases[compact]) return aliases[compact]

  return compact
    .replace(/\s+AND\s+/gi, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_ISLANDS$/g, '')
    .replace(/_CITY$/g, '')
}

@Controller('shipping')
export class ShippingController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.shippingRule.findMany()
  }

  @Post('calculate')
  async calculate(@Body() body: { state?: string; subtotal?: number; paymentMethod?: string; totalWeight?: number }) {
    const subtotal = Number(body?.subtotal || 0)
    const rawState = (body?.state || '').trim()
    const normalized = normalizeState(rawState)
    const isCod = (body?.paymentMethod || 'online') === 'cod'
    const totalWeight = Math.max(0, Number(body?.totalWeight) || 0)
    const [settings, rules] = await Promise.all([
      this.prisma.appSettings.findFirst(),
      this.prisma.shippingRule.findMany(),
    ])
    const onlineThreshold = Number(settings?.freeShippingThreshold || 0)
    const codThreshold = Number(settings?.freeShippingCodThreshold || 0)
    const codChargeSetting = Number(settings?.codShippingCharge || 0)

    const rule = normalized
      ? rules.find((r) => r.state === normalized || normalizeState(r.state) === normalized)
      : undefined

    // Weight-based slabs take priority over the flat rate; flat rate is the fallback
    let baseFee = rule ? Number(rule.flatShippingRate) : 0
    let appliedWeightKg: number | null = null
    let weightRateApplied = false

    const weightRates = Array.isArray(rule?.weightRates)
      ? (rule.weightRates as Array<{ weightKg?: unknown; rate?: unknown }>)
          .map((w) => ({ weightKg: Number(w?.weightKg) || 0, rate: Number(w?.rate) || 0 }))
          .filter((w) => w.weightKg > 0 && w.rate >= 0)
          .sort((a, b) => a.weightKg - b.weightKg)
      : []

    if (weightRates.length > 0) {
      // Use the largest weight slab that is less than or equal to the order weight.
      // This matches the business rule where 0.7kg uses the 0.5kg rate and 1.5kg uses the 1kg rate.
      const matched = [...weightRates]
        .filter((w) => totalWeight >= w.weightKg)
        .sort((a, b) => b.weightKg - a.weightKg)[0]

      if (matched) {
        baseFee = matched.rate
        appliedWeightKg = matched.weightKg
        weightRateApplied = true
      }
    }

    // Free-shipping / COD-charge waivers configured in Admin > Settings
    let isFreeShipping = false
    let codFee = 0
    if (isCod) {
      codFee = codChargeSetting
      if (codThreshold > 0 && subtotal >= codThreshold) {
        if (settings?.freeShippingCombinedDeliveryFee) isFreeShipping = true
        if (settings?.freeShippingCombinedCodFee) codFee = 0
      }
    } else {
      if (onlineThreshold > 0 && subtotal >= onlineThreshold) {
        if (settings?.freeShippingOnlineDeliveryFee) isFreeShipping = true
      } else if (codThreshold > 0 && subtotal >= codThreshold) {
        if (settings?.freeShippingCombinedDeliveryFee) isFreeShipping = true
      }
    }

    const shippingFee = isFreeShipping ? 0 : baseFee
    const activeThreshold = isCod ? codThreshold : onlineThreshold > 0 ? onlineThreshold : codThreshold
    const remainingForFree = activeThreshold > 0 ? Math.max(0, activeThreshold - subtotal) : 0

    return {
      state: rawState,
      paymentMethod: isCod ? 'cod' : 'online',
      baseFee,
      shippingFee,
      codFee,
      isFreeShipping,
      remainingForFree,
      freeShippingThreshold: onlineThreshold,
      freeShippingCodThreshold: codThreshold,
      ruleApplied: !!rule,
      codAvailable: rule ? rule.codAvailable : true,
      totalWeight,
      appliedWeightKg,
      weightRateApplied,
    }
  }

  @Post()
  create(@Body() createShippingDto: { state: string; flatShippingRate: number; codAvailable?: boolean; weightRates?: Array<{ weightKg: number; rate: number }> }) {
    return this.prisma.shippingRule.create({
      data: {
        state: normalizeState(createShippingDto.state) as IndianState,
        flatShippingRate: createShippingDto.flatShippingRate,
        codAvailable: createShippingDto.codAvailable ?? true,
        weightRates: (createShippingDto.weightRates ?? undefined) as never
      }
    })
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateShippingDto: { state: string; flatShippingRate: number; codAvailable?: boolean; weightRates?: Array<{ weightKg: number; rate: number }> }) {
    const data: Record<string, unknown> = {
      state: normalizeState(updateShippingDto.state) as IndianState,
      flatShippingRate: updateShippingDto.flatShippingRate,
      codAvailable: updateShippingDto.codAvailable ?? true
    }
    if (updateShippingDto.weightRates !== undefined) {
      data.weightRates = (updateShippingDto.weightRates.length ? updateShippingDto.weightRates : null) as never
    }
    return this.prisma.shippingRule.update({ where: { id: +id }, data })
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.shippingRule.delete({
      where: { id: +id }
    })
  }
}