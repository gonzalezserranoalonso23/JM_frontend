// Helpers shared by pages and dialogs.

export const toNumber = (value) => {
  const number = parseFloat(value)
  return Number.isFinite(number) ? number : 0
}

export const roundTo = (value, decimals) => {
  const factor = 10 ** decimals
  return Math.round((toNumber(value) + Number.EPSILON) * factor) / factor
}

export const yieldToMain = () =>
  new Promise((resolve) => {
    if (typeof globalThis.scheduler?.yield === 'function') {
      globalThis.scheduler.yield().then(resolve)
      return
    }
    setTimeout(resolve, 0)
  })

// Amount in pesos with 2 decimals: formatMoney(12.5) -> "$12.50"
export const formatMoney = (value) => `$${toNumber(value).toFixed(2)}`

export const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN'
  })

export const formatPercent = (value) =>
  `${Number(value || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}%`

// quantity x price as text with 2 decimals; '' when either value is not a number.
export const calcLineTotal = (quantity, price) => {
  const qty = parseFloat(quantity)
  const unit = parseFloat(price)
  if (!Number.isFinite(qty) || !Number.isFinite(unit)) return ''
  return (qty * unit).toFixed(2)
}

// Quantity or stock with at most 3 decimals and no trailing zeros: 0.30000000000000004 -> 0.3
export const formatQty = (value) => roundTo(value, 3)

// Warehouse stock and what this cart can still use. The original does not change.
// Available subtracts only the quantities already added.
export const informativeStock = (original, used) => {
  const stock = roundTo(original, 3)
  const inCart = roundTo(used, 3)
  return {
    original: stock,
    inCart,
    available: roundTo(stock - inCart, 3)
  }
}

const extraDecimals = /^(-?\d*\.\d{3})\d+$/

export const clampNumberInputValue = (value) => {
  const match = String(value ?? '').match(extraDecimals)
  return match ? match[1] : value
}

export const limitNumberInputDecimals = (input) => {
  if (input?.tagName !== 'INPUT' || input.type !== 'number') return
  const next = clampNumberInputValue(input.value)
  if (next === input.value) return
  input.value = next
}

export const sumBy = (items, getValue) =>
  items.reduce((sum, item) => sum + toNumber(getValue(item)), 0)

export const createTempId = () => `${Date.now()}-${Math.random()}`

export const confirmDiscardChanges = () =>
  window.confirm('Hay cambios sin guardar. ¿Deseas cerrar y descartarlos?')
