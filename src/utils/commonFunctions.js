// Funciones compartidas entre páginas y modales.

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

// Monto en pesos con 2 decimales: formatMoney(12.5) -> "$12.50"
export const formatMoney = (value) => `$${toNumber(value).toFixed(2)}`

// cantidad x precio como texto con 2 decimales; '' si alguno no es numérico
export const calcLineTotal = (quantity, price) => {
  const qty = parseFloat(quantity)
  const unit = parseFloat(price)
  if (!Number.isFinite(qty) || !Number.isFinite(unit)) return ''
  return (qty * unit).toFixed(2)
}

// Cantidad/stock con máximo 3 decimales y sin ceros sobrantes: 0.30000000000000004 -> 0.3
export const formatQty = (value) => roundTo(value, 3)

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
