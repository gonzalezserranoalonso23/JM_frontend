import { formatDate, isoDay } from './dateDisplay'

// It matches when the text includes the query or when the query is a valid regular expression.
// An invalid pattern is evaluated with includes only.
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

// Text of a date: ISO, the local format, and the written day and month in Spanish.
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

// Filter by cell: only the text of the given cells is evaluated.
export const matchesCells = (cells, matcher) =>
  !matcher || cells.some((cell) => matcher(String(cell ?? '')))
