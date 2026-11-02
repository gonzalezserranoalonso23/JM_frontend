import { useEffect, useState } from 'react'
import PageShell from '@/components/PageShell'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Skeleton from '@/components/ui/skeleton'
import useIntersectionPagination from '@/hooks/useIntersectionPagination'
import { useAuthStore } from '@/store/auth'
import { useGetCurrentUser } from '@/features/users.features'
import { hasSchedule } from '@/pages/users/schedule'
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
          new Error('Activa la ubicación para registrar la entrada en el trabajo')
        ),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  })

const personName = (user) => user?.fullName || user?.username || 'Sin nombre'

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
    from: rangeInvalid ? '' : from,
    to: rangeInvalid ? '' : to
  })
  const { sentinelRef, supportsIntersectionObserver } =
    useIntersectionPagination(
      fetchNextPage,
      Boolean(hasNextPage) && !isFetchingNextPage && !rangeInvalid
    )
  const checkIn = useCheckIn()
  const checkOut = useCheckOut()
  const summary = data?.pages?.[0]
  const records = rangeInvalid
    ? []
    : (data?.pages ?? []).flatMap((page) => page.records ?? [])
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

  const punch = () => {
    if (dayOff) return
    if (open) {
      if (!window.confirm('¿Registrar tu salida?')) return
      checkOut.mutate()
      return
    }
    if (!window.confirm('¿Registrar tu entrada?')) return
    readPosition().then(
      (position) => checkIn.mutate(position),
      (error) => toast.error(error.message)
    )
  }

  return (
    <Card
      as="section"
      className="w-full gap-4 p-4 sm:max-w-md sm:p-6"
      aria-labelledby="attendance-title"
    >
      <header>
        <h1 id="attendance-title" className="text-xl font-semibold">
          Asistencia
        </h1>
      </header>
      {isError && !summary ? (
        <Alert variant="destructive">No se pudo cargar tu asistencia</Alert>
      ) : !summary ? (
        <div role="status" aria-label="Cargando" className="grid gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full sm:w-48" />
        </div>
      ) : (
        <>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">{nowLabel}</p>
            {open && open.date !== today && (
              <p className="mt-1 text-sm text-muted-foreground">
                La entrada abierta es del {formatDay(open.date)}. Registra la
                salida antes de una entrada nueva.
              </p>
            )}
          </div>
          <Button
            type="button"
            className="h-12 w-full text-base sm:w-fit sm:min-w-48 sm:px-8"
            variant={open ? 'destructive' : 'default'}
            disabled={pending || dayOff}
            onClick={punch}
          >
            {pending
              ? 'Registrando...'
              : open
                ? 'Registrar salida'
                : dayOff
                  ? 'Hoy no es tu día de trabajo'
                  : 'Registrar entrada'}
          </Button>
        </>
      )}
      {!(isError && !summary) && (
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
            {listPending || !summary ? (
              <RecordSkeleton />
            ) : records.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                Aún no hay registros
              </p>
            ) : (
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
                        {record.checkOutAt
                          ? formatTime(record.checkOutAt)
                          : 'en turno'}
                      </span>
                    </li>
                  ))}
                </ul>
                {hasNextPage && supportsIntersectionObserver && (
                  <div ref={sentinelRef} className="h-1" aria-hidden="true" />
                )}
                {isFetchingNextPage && <RecordSkeleton rows={2} />}
                {hasNextPage && !supportsIntersectionObserver && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    Cargar más
                  </Button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </Card>
  )
}

const shiftLabel = (record) =>
  record
    ? `${formatTime(record.checkInAt)} – ${
        record.checkOutAt ? formatTime(record.checkOutAt) : 'en turno'
      }`
    : 'Sin registro'

const AdminBoard = () => {
  const [date, setDate] = useState(todayMexicoCity())
  const { data, isLoading, isError } = useAttendanceDay(date)
  const records = data?.records ?? []
  const byUser = records.reduce((acc, record) => {
    const id = String(record.user?._id || '')
    acc[id] = acc[id] ? [...acc[id], record] : [record]
    return acc
  }, {})
  const rows = (data?.staff ?? []).map((user) => ({
    user,
    shifts: byUser[String(user._id)] ?? []
  }))

  return (
    <Card as="section" className="gap-4 p-4 sm:p-6" aria-labelledby="attendance-board-title">
      <header>
        <h1 id="attendance-board-title" className="text-xl font-semibold">
          Asistencia del personal
        </h1>
        <p className="text-sm text-muted-foreground">
          Entradas y salidas del personal
        </p>
      </header>
      <div className="grid w-full max-w-xs gap-2">
        <Input
          id="attendance-date"
          type="date"
          aria-label="Fecha"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>
      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <Alert variant="destructive">No se pudo cargar la asistencia</Alert>
      ) : rows.length === 0 ? (
        <Alert>No hay personal registrado</Alert>
      ) : (
        <ul className="m-0 list-none divide-y rounded-lg border p-0">
          {rows.map(({ user, shifts }) => (
            <li
              key={user._id}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
            >
              <div className="min-w-0">
                <p className="break-words font-medium">{personName(user)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{user.username}</p>
              </div>
              <div className="text-sm text-muted-foreground sm:shrink-0 sm:text-right">
                {shifts.length === 0 ? (
                  <span>Sin registro</span>
                ) : (
                  shifts.map((shift) => (
                    <p key={shift._id}>{shiftLabel(shift)}</p>
                  ))
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

const Attendance = () => {
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const { data: me } = useGetCurrentUser()
  const withSchedule = hasSchedule(me)

  return (
    <PageShell>
      <div className="grid gap-4">
        {withSchedule && <StaffClock />}
        {isAdmin && <AdminBoard />}
      </div>
    </PageShell>
  )
}

export default Attendance
