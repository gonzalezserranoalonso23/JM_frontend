import { formatMoney, roundTo } from './commonFunctions'

export const ALL_USERS = 'all'

export const formatDay = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''))
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

export const formatNow = (instant = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(instant)
  const value = (type) => parts.find((part) => part.type === type)?.value ?? ''
  return `Fecha: ${value('hour')}:${value('minute')}:${value('second')} ${value('day')}/${value('month')}/${value('year')}`
}

export const formatTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'America/Mexico_City'
  })
}

export const personName = (user) =>
  user?.fullName || user?.username || 'Sin nombre'

export const recordEnd = (record) => {
  if (record.checkOutAt) return formatTime(record.checkOutAt)
  return 'en turno'
}

export const punchCopy = ({ pending, open, dayOff }) => {
  if (pending) return 'Registrando...'
  if (open) return 'Registrar salida'
  if (dayOff) return 'Hoy no es tu día de trabajo'
  return 'Registrar entrada'
}

export const moneyOrDash = (value) => {
  if (value == null || value === '') return '—'
  return formatMoney(value)
}

export const paidToSuppliers = (payments) =>
  (payments ?? []).reduce(
    (total, payment) => roundTo(total + Number(payment?.amount || 0), 2),
    0
  )

export const supplierLabel = (supplier) =>
  supplier?.suppliersName || supplier?.name || 'Proveedor'

export const paymentLabel = (payments) => {
  const rows = payments ?? []
  if (rows.length === 0) return '—'
  const lines = rows.map(
    (payment) =>
      `${supplierLabel(payment.supplier)} ${formatMoney(payment.amount)}`
  )
  return `${lines.join(', ')} · Total ${formatMoney(paidToSuppliers(rows))}`
}

export const attendanceRows = (staff, records, userId) => {
  const byUser = records.reduce((acc, record) => {
    const id = String(record.user?._id || '')
    if (!acc[id]) acc[id] = []
    acc[id].push(record)
    return acc
  }, {})
  const people =
    userId === ALL_USERS
      ? staff
      : staff.filter((user) => String(user._id) === userId)

  return people.flatMap((user) => {
    const shifts = byUser[String(user._id)] ?? []
    if (shifts.length === 0) {
      return [
        {
          key: String(user._id),
          name: personName(user),
          username: user.username,
          start: 'Sin registro',
          end: '—',
          received: '—',
          cut: '—',
          payments: [],
          total: '—'
        }
      ]
    }
    return shifts.map((shift) => {
      const payments = shift.supplierPayments ?? []
      return {
        key: shift._id,
        name: personName(user),
        username: user.username,
        start: formatTime(shift.checkInAt),
        end: recordEnd(shift),
        received: moneyOrDash(shift.cashReceived),
        cut: moneyOrDash(shift.cashCut),
        payments: payments.map((payment, index) => ({
          key: `${shift._id}-${index}`,
          name: supplierLabel(payment.supplier),
          amount: formatMoney(payment.amount)
        })),
        total: payments.length ? formatMoney(paidToSuppliers(payments)) : '—'
      }
    })
  })
}

export const attendancePages = (data) => {
  const { pages = [] } = data ?? {}
  const [summary = {}] = pages
  const { open = null, workDay = false } = summary
  const records = pages.flatMap((page) => {
    const { records: rows = [] } = page
    return rows
  })
  return {
    loaded: pages.length > 0,
    open,
    workDay: Boolean(workDay),
    records
  }
}

export const attendanceDay = (data) => {
  const { staff = [], records = [] } = data ?? {}
  return { staff, records }
}
