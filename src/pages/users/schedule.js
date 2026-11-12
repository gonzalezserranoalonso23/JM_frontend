export const WEEK_DAYS = [
  ['monday', 'Lunes', 'Lun'],
  ['tuesday', 'Martes', 'Mar'],
  ['wednesday', 'Miércoles', 'Mié'],
  ['thursday', 'Jueves', 'Jue'],
  ['friday', 'Viernes', 'Vie'],
  ['saturday', 'Sábado', 'Sáb'],
  ['sunday', 'Domingo', 'Dom']
]

export const hasSchedule = (user) =>
  Boolean(user?.haveSchedule) ||
  WEEK_DAYS.some(([day]) => user?.schedule?.[day]?.enabled)

export const scheduleFromUser = (user) =>
  Object.fromEntries(
    WEEK_DAYS.map(([day]) => {
      const row = user?.schedule?.[day]
      return [
        day,
        {
          enabled: Boolean(row?.enabled),
          start: row?.start || '09:00',
          end: row?.end || '18:00'
        }
      ]
    })
  )

export const roleIdFromUser = (user) => {
  const role = user?.role
  if (!role) return ''
  if (typeof role === 'string') return role
  return role._id || ''
}
