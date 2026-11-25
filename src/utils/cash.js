import { formatCurrency } from './commonFunctions'

export const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5]

export const formatDenomination = (value) =>
  value < 1
    ? `$${Number(value).toFixed(2)}`
    : `$${Number(value).toLocaleString('es-MX', { maximumFractionDigits: 2 })}`

export const quantityOf = (quantities, denomination) =>
  Math.max(0, Math.floor(Number(quantities[denomination]) || 0))

export const countedTotal = (denominations, quantities) =>
  denominations.reduce(
    (sum, denomination) =>
      sum + denomination * quantityOf(quantities, denomination),
    0
  )

export const countedBreakdown = (denominations, quantities) =>
  denominations.reduce(
    (counts, denomination) => {
      const quantity = quantityOf(quantities, denomination)
      counts.units += quantity
      counts[denomination >= 20 ? 'bills' : 'coins'] += quantity
      return counts
    },
    { units: 0, bills: 0, coins: 0 }
  )

export { formatCurrency as formatAmount }
