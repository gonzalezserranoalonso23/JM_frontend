export const callHref = (phone) => {
  const compact = String(phone).replace(/[^\d+]/g, '')
  if (!compact || compact === '+') return ''
  return `tel:${compact}`
}

// México: 10 dígitos se completan con 52. wa.me abre la app si está instalada.
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
