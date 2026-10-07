import { formatDate, isoDay } from './dateDisplay'

// Coincide si el texto lo incluye (includes) o si cumple como expresión regular.
// Un patrón inválido solo se evalúa con includes.
export const buildMatcher = (pattern) => {
  const value = String(pattern || '').trim()
  if (!value) return null
  const needle = value.toLowerCase()
  let regex = null
  try {
    regex = new RegExp(value, 'i')
  } catch {
    regex = null
  }
  return (text) =>
    text.toLowerCase().includes(needle) || Boolean(regex && regex.test(text))
}

// Texto de una fecha: ISO, formato local y escrita (día y mes en español).
export const dateCells = (value) => {
  const iso = isoDay(value)
  if (!iso) return []
  return [
    iso,
    formatDate(value),
    formatDate(value, 'es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  ]
}

// Filtra por celda: solo se evalúan los textos de las celdas indicadas.
export const matchesCells = (cells, matcher) =>
  !matcher || cells.some((cell) => matcher(String(cell ?? '')))
