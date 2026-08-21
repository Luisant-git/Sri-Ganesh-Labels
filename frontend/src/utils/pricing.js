export function getTierUnitPrice(tiers, fallbackPrice, qty) {
  if (!Array.isArray(tiers) || tiers.length === 0) return null
  const q = Number(qty) || 1
  let match = null
  for (const t of tiers) {
    const tq = parseInt(t?.quantity, 10)
    if (!tq || tq < 1) continue
    if (q >= tq) {
      const total = t?.totalValue != null ? Number(t.totalValue) : parseFloat(t?.price)
      if (!isNaN(total)) match = { quantity: tq, totalValue: total }
    }
  }
  if (!match) return null
  // Tier value is the TOTAL price for that quantity — convert to per-piece unit price
  return Math.round((match.totalValue / match.quantity) * 100) / 100
}
