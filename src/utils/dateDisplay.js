// The day comes from the stored YYYY-MM-DD part, without converting time
// zones, so it does not depend on the server or the browser.
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})/
const LOCAL_DAY = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/

const createDate = (year, month, day) => {
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

const getDateParts = (value) => {
  const text = String(value || '')
  const isoMatch = ISO_DAY.exec(text)
  if (isoMatch) {
    return {
      year: Number(isoMatch[1]),
      month: Number(isoMatch[2]),
      day: Number(isoMatch[3])
    }
  }

  const localMatch = LOCAL_DAY.exec(text)
  if (!localMatch) return null
  const year = Number(localMatch[3])
  return {
    year: year < 100 ? 2000 + year : year,
    month: Number(localMatch[2]),
    day: Number(localMatch[1])
  }
}

const toLocalDate = (value) => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : new Date(value.getFullYear(), value.getMonth(), value.getDate())
  }
  const parts = getDateParts(value)
  return parts ? createDate(parts.year, parts.month, parts.day) : null
}

export const isoDay = (value) => {
  const parts = getDateParts(value)
  if (!parts) return ''
  const date = toLocalDate(value)
  if (!date) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`
}

export const formatDate = (value, locale, options) => {
  const date = toLocalDate(value)
  return date ? date.toLocaleDateString(locale, options) : ''
}

const pad = (n) => String(n).padStart(2, '0')

// Today in Mexico City. Does not use the device time zone.
export const todayMexicoCity = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date())
  const value = (type) => parts.find((part) => part.type === type)?.value
  return `${value('year')}-${value('month')}-${value('day')}`
}

export const addCalendarDays = (isoDay, offsetDays) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoDay || ''))
  if (!match) return ''
  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  )
  date.setUTCDate(date.getUTCDate() + offsetDays)
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

export const yesterdayMexicoCity = () => addCalendarDays(todayMexicoCity(), -1)

// Today in the device time zone, not UTC.
export const todayLocal = (offsetDays = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
