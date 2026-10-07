// El día se toma de la parte YYYY-MM-DD del valor guardado, sin convertir zonas
// horarias, así no depende de dónde esté el backend ni del navegador.
const DAY = /^(\d{4})-(\d{2})-(\d{2})/

const toLocalDate = (value) => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : new Date(value.getFullYear(), value.getMonth(), value.getDate())
  }
  const match = DAY.exec(String(value))
  if (!match) return null
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  )
  return Number.isNaN(date.getTime()) ? null : date
}

export const isoDay = (value) => {
  const match = DAY.exec(String(value || ''))
  if (match) return match[0]
  const date = toLocalDate(value)
  if (!date) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const formatDate = (value, locale, options) => {
  const date = toLocalDate(value)
  return date ? date.toLocaleDateString(locale, options) : ''
}

const pad = (n) => String(n).padStart(2, '0')

// Fecha de hoy según la zona horaria del dispositivo (no UTC).
export const todayLocal = (offsetDays = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
