import { formatCurrency } from './commonFunctions'

export const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5]

export const formatDenomination = (value) => {
  if (value < 1) return `$${Number(value).toFixed(2)}`
  return `$${Number(value).toLocaleString('es-MX', { maximumFractionDigits: 2 })}`
}

export const formatUpdatedAt = (value) =>
  new Date(value).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

export const quantityOf = (quantities, denomination) =>
  Math.max(0, Math.floor(Number(quantities[denomination]) || 0))

export const draftQuantity = (quantity) => {
  if (Number(quantity) > 0) return String(quantity)
  return ''
}

export const draftFromVault = (vault) =>
  Object.fromEntries(
    (vault?.denominations ?? []).map((item) => [
      item.value,
      draftQuantity(item.quantity)
    ])
  )

export const countedTotal = (denominations, quantities) =>
  denominations.reduce(
    (sum, denomination) =>
      sum + denomination * quantityOf(quantities, denomination),
    0
  )

export const countedRows = (rows, quantities) =>
  rows.reduce(
    (sum, item) => sum + item.value * quantityOf(quantities, item.value),
    0
  )

export { formatCurrency as formatAmount }
