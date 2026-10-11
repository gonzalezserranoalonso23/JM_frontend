export const PAYMENT_TYPES = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TARJETA', label: 'Tarjeta' }
]

export const PAYMENT_LABELS = Object.fromEntries(
  PAYMENT_TYPES.map(({ value, label }) => [value, label])
)
