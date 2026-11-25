export const callHref = (phone) => {
  const compact = String(phone).replace(/[^\d+]/g, '')
  if (!compact || compact === '+') return ''
  return `tel:${compact}`
}

// Mexico: 10 digits are completed with 52. wa.me opens the app when it is installed.
export const whatsappHref = (phone) => {
  const digits = String(phone).replace(/\D/g, '')
  if (digits.length < 10) return ''
  let number = digits
  if (digits.length === 10) number = `52${digits}`
  else if (digits.startsWith('521') && digits.length === 13) {
    number = `52${digits.slice(3)}`
  }
  return `https://wa.me/${number}`
}
