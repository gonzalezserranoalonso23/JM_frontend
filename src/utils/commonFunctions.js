// Funciones compartidas entre páginas y modales.

export const toNumber = (value) => {
  const number = parseFloat(value)
  return Number.isFinite(number) ? number : 0
}

// Monto en pesos con 2 decimales: formatMoney(12.5) -> "$12.50"
export const formatMoney = (value) => `$${toNumber(value).toFixed(2)}`

// cantidad x precio como texto con 2 decimales; '' si alguno no es numérico
export const calcLineTotal = (quantity, price) => {
  const qty = parseFloat(quantity)
  const unit = parseFloat(price)
  if (!Number.isFinite(qty) || !Number.isFinite(unit)) return ''
  return (qty * unit).toFixed(2)
}

export const sumBy = (items, getValue) =>
  items.reduce((sum, item) => sum + toNumber(getValue(item)), 0)

export const createTempId = () => `${Date.now()}-${Math.random()}`

export const confirmDiscardChanges = () =>
  window.confirm('Hay cambios sin guardar. ¿Deseas cerrar y descartarlos?')
