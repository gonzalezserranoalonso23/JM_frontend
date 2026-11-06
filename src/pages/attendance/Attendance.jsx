import { useEffect, useState } from 'react'
import PageShell from '@/components/PageShell'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Skeleton from '@/components/ui/skeleton'
import useIntersectionPagination from '@/hooks/useIntersectionPagination'
import { hasFullAccess } from '@/auth/access'
import { useRoleName } from '@/features/users.features'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { todayMexicoCity } from '@/utils/dateDisplay'
import { toast } from 'react-hot-toast'
import {
  useMyAttendance,
  useAttendanceDay,
  useCheckIn,
  useCheckOut
} from '@/features/attendance.features'
import ListSkeleton from '@/components/ListSkeleton'

const formatDay = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''))
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

const formatNow = (instant = new Date()) => {
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

const formatTime = (value) => {
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

const readPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Este dispositivo no puede compartir la ubicación'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }),
      () =>
        reject(
          new Error(
            'Activa la ubicación para registrar la entrada en el trabajo'
          )
        ),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  })

const personName = (user) => user?.fullName || user?.username || 'Sin nombre'

const recordEnd = (record) => {
  if (record.checkOutAt) return formatTime(record.checkOutAt)
  return 'en turno'
}

const punchCopy = ({ pending, open, dayOff }) => {
  if (pending) return 'Registrando...'
  if (open) return 'Registrar salida'
  if (dayOff) return 'Hoy no es tu día de trabajo'
  return 'Registrar entrada'
}

const punchVariant = (open) => {
  if (open) return 'destructive'
  return 'default'
}

const punchAtWork = (mutate) => {
  readPosition().then(
    (position) => mutate(position),
    (error) => toast.error(error.message)
  )
}

const confirmPunch = ({ open, dayOff, checkIn, checkOut }) => {
  if (dayOff) return
  if (open) {
    if (!window.confirm('¿Registrar tu salida?')) return
    punchAtWork(checkOut.mutate)
    return
  }
  if (!window.confirm('¿Registrar tu entrada?')) return
  punchAtWork(checkIn.mutate)
}

const ClockPanel = ({
  failed,
  summary,
  nowLabel,
  open,
  today,
  pending,
  dayOff,
  onPunch
}) => {
  if (failed) {
    return <Alert variant="destructive">No se pudo cargar tu asistencia</Alert>
  }
  if (!summary) {
    return (
      <div role="status" aria-label="Cargando" className="grid gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full sm:w-48" />
      </div>
    )
  }

  let staleOpen = null
  if (open && open.date !== today) {
    staleOpen = (
      <p className="mt-1 text-sm text-muted-foreground">
        La entrada abierta es del {formatDay(open.date)}. Registra la salida
        antes de una entrada nueva.
      </p>
    )
  }

  return (
    <>
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">{nowLabel}</p>
        {staleOpen}
      </div>
      <Button
        type="button"
        className="h-12 w-full text-base xl:w-fit xl:min-w-48 xl:px-8"
        variant={punchVariant(open)}
        disabled={pending || dayOff}
        onClick={onPunch}
      >
        {punchCopy({ pending, open, dayOff })}
      </Button>
    </>
  )
}

const HistoryList = ({
  records,
  listPending,
  summary,
  hasNextPage,
  supportsIntersectionObserver,
  sentinelRef,
  isFetchingNextPage,
  fetchNextPage
}) => {
  if (listPending || !summary) return <RecordSkeleton />
  if (records.length === 0) {
    return (
      <p className="px-4 py-3 text-sm text-muted-foreground">
        Aún no hay registros
      </p>
    )
  }

  let sentinel = null
  if (hasNextPage && supportsIntersectionObserver) {
    sentinel = <div ref={sentinelRef} className="h-1" aria-hidden="true" />
  }

  let nextPage = null
  if (isFetchingNextPage) nextPage = <RecordSkeleton rows={2} />

  let loadMore = null
  if (hasNextPage && !supportsIntersectionObserver) {
    loadMore = (
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => fetchNextPage()}
        disabled={isFetchingNextPage}
      >
        Cargar más
      </Button>
    )
  }

  return (
    <>
      <ul className="m-0 list-none divide-y p-0">
        {records.map((record) => (
          <li
            key={record._id}
            className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <span className="text-sm font-medium">
              {formatDay(record.date)}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatTime(record.checkInAt)}
              {' – '}
              {recordEnd(record)}
            </span>
          </li>
        ))}
      </ul>
      {sentinel}
      {nextPage}
      {loadMore}
    </>
  )
}

const RecordSkeleton = ({ rows = 3 }) => (
  <div role="status" aria-label="Cargando" className="divide-y">
    {Array.from({ length: rows }, (_, index) => (
      <div
        key={index}
        className="flex items-center justify-between gap-4 px-4 py-3"
      >
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>
    ))}
  </div>
)

export const StaffClock = () => {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const rangeInvalid = Boolean(from && to && from > to)
  let queryFrom = from
  let queryTo = to
  if (rangeInvalid) {
    queryFrom = ''
    queryTo = ''
  }
  const {
    data,
    isLoading,
    isError,
    isFetching,
    isPlaceholderData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useMyAttendance({
    from: queryFrom,
    to: queryTo
  })
  const { sentinelRef, supportsIntersectionObserver } =
    useIntersectionPagination(
      fetchNextPage,
      Boolean(hasNextPage) && !isFetchingNextPage && !rangeInvalid
    )
  const checkIn = useCheckIn()
  const checkOut = useCheckOut()
  const summary = data?.pages?.[0]
  let records = []
  if (!rangeInvalid) {
    records = (data?.pages ?? []).flatMap((page) => page.records ?? [])
  }
  const listPending =
    !rangeInvalid &&
    (isLoading || (isPlaceholderData && isFetching && !isFetchingNextPage))
  const open = summary?.open
  const workDay = Boolean(summary?.workDay)
  const today = todayMexicoCity()
  const pending = checkIn.isPending || checkOut.isPending
  const dayOff = !open && !workDay
  const [nowLabel, setNowLabel] = useState(formatNow)

  useEffect(() => {
    const timer = setInterval(() => setNowLabel(formatNow()), 1000)
    return () => clearInterval(timer)
  }, [])

  const punch = () => confirmPunch({ open, dayOff, checkIn, checkOut })

  const showHistory = !(isError && !summary)

  return (
    <Card
      as="section"
      className="w-full gap-4 p-4 sm:p-6"
      aria-labelledby="attendance-title"
    >
      <header>
        <h1 id="attendance-title" className="text-xl font-semibold">
          Asistencia
        </h1>
      </header>
      <ClockPanel
        failed={isError && !summary}
        summary={summary}
        nowLabel={nowLabel}
        open={open}
        today={today}
        pending={pending}
        dayOff={dayOff}
        onPunch={punch}
      />
      {showHistory && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="attendance-from">Desde</Label>
              <Input
                id="attendance-from"
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="attendance-to">Hasta</Label>
              <Input
                id="attendance-to"
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto rounded-lg border">
            <HistoryList
              records={records}
              listPending={listPending}
              summary={summary}
              hasNextPage={hasNextPage}
              supportsIntersectionObserver={supportsIntersectionObserver}
              sentinelRef={sentinelRef}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
            />
          </div>
        </>
      )}
    </Card>
  )
}

const ALL_USERS = 'all'

const attendanceRows = (staff, records, userId) => {
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
          end: '—'
        }
      ]
    }
    return shifts.map((shift) => ({
      key: shift._id,
      name: personName(user),
      username: user.username,
      start: formatTime(shift.checkInAt),
      end: recordEnd(shift)
    }))
  })
}

const AttendanceTable = ({ rows }) => {
  if (rows.length === 0) return <Alert>No hay personal con horario</Alert>
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Entrada</TableHead>
            <TableHead>Salida</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key}>
              <TableCell>
                <p className="font-medium">{row.name}</p>
                <p className="text-xs text-muted-foreground">{row.username}</p>
              </TableCell>
              <TableCell>{row.start}</TableCell>
              <TableCell>{row.end}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

const AdminBoard = () => {
  const [date, setDate] = useState(todayMexicoCity())
  const [userId, setUserId] = useState(ALL_USERS)
  const { data, isLoading, isError } = useAttendanceDay(date)
  const staff = data?.staff ?? []
  const rows = attendanceRows(staff, data?.records ?? [], userId)
  let body = <AttendanceTable rows={rows} />
  if (isLoading) body = <ListSkeleton />
  if (isError) {
    body = <Alert variant="destructive">No se pudo cargar la asistencia</Alert>
  }

  return (
    <Card
      as="section"
      className="gap-4 p-4 sm:p-6"
      aria-labelledby="attendance-board-title"
    >
      <header>
        <h1 id="attendance-board-title" className="text-xl font-semibold">
          Asistencias
        </h1>
      </header>
      <div className="flex flex-wrap items-end gap-4">
        <div className="grid w-full max-w-xs gap-2">
          <Label htmlFor="attendance-date">Fecha</Label>
          <Input
            id="attendance-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
        <div className="grid w-full min-w-52 max-w-xs gap-2">
          <Label htmlFor="attendance-user">Usuario</Label>
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger id="attendance-user">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_USERS}>Todos</SelectItem>
              {staff.map((user) => (
                <SelectItem key={user._id} value={String(user._id)}>
                  {personName(user)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {body}
    </Card>
  )
}

export const AttendancePunch = () => {
  const { data, isError } = useMyAttendance()
  const checkIn = useCheckIn()
  const checkOut = useCheckOut()
  const summary = data?.pages?.[0]
  const open = summary?.open
  const workDay = Boolean(summary?.workDay)
  const today = todayMexicoCity()
  const pending = checkIn.isPending || checkOut.isPending
  const dayOff = !open && !workDay
  const [nowLabel, setNowLabel] = useState(formatNow)

  useEffect(() => {
    const timer = setInterval(() => setNowLabel(formatNow()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section aria-labelledby="profile-punch" className="grid gap-3">
      <h2 id="profile-punch" className="text-sm font-semibold">
        Asistencia
      </h2>
      <ClockPanel
        failed={isError && !summary}
        summary={summary}
        nowLabel={nowLabel}
        open={open}
        today={today}
        pending={pending}
        dayOff={dayOff}
        onPunch={() => confirmPunch({ open, dayOff, checkIn, checkOut })}
      />
    </section>
  )
}

const StaffAttendance = () => (
  <PageShell>
    <div className="w-full sm:max-w-md">
      <StaffClock />
    </div>
  </PageShell>
)

const AdminAttendance = () => (
  <PageShell>
    <AdminBoard />
  </PageShell>
)

const Attendance = () => {
  const roleName = useRoleName()

  if (hasFullAccess(roleName)) return <AdminAttendance />

  return <StaffAttendance />
}

export default Attendance
