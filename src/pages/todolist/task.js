export const taskUserId = (value) => {
  if (!value) return ''
  if (typeof value === 'object') return String(value._id || '')
  return String(value)
}
