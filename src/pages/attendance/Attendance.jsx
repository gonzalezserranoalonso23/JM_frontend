import { useState } from 'react'
import PageShell from '@/components/PageShell'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/auth'
import { todayMexicoCity, formatDate } from '@/utils/dateDisplay'
import { toast } from 'react-hot-toast'
import {
  useMyAttendance,
  useAttendanceDay,
  useCheckIn,
  useCheckOut
} from '@/features/attendance.features'
import ListSkeleton from '@/components/ListSkeleton'

const formatTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
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

const StaffClock = () => {
  const { data, isLoading, isError } = useMyAttendance()
  const checkIn = useCheckIn()
  const checkOut = useCheckOut()
  const open = data?.open
  const today = todayMexicoCity()
  const pending = checkIn.isPending || checkOut.isPending

  const punch = () => {
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
    <Card as="section" className="gap-4 p-4 sm:p-6" aria-labelledby="attendance-title">
      <header>
        <h1 id="attendance-title" className="text-xl font-semibold">
          Asistencia
        </h1>
        <p className="text-sm text-muted-foreground">
          La fecha es la de Ciudad de México y no se puede cambiar. La entrada
          solo se registra en el lugar de trabajo.
        </p>
      </header>
      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <Alert variant="destructive">No se pudo cargar tu asistencia</Alert>
      ) : (
        <>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              Hoy en Ciudad de México, {formatDate(today, 'es-MX')}
            </p>
            <p className="mt-1 text-lg font-semibold">
              {open
                ? `En turno desde ${formatTime(open.checkInAt)}`
                : 'Fuera de turno'}
            </p>
            {open && open.date !== today && (
              <p className="mt-1 text-sm text-muted-foreground">
                La entrada abierta es del {formatDate(open.date, 'es-MX')}.
                Registra la salida antes de una entrada nueva.
              </p>
            )}
          </div>
          <Button
            type="button"
            className="h-12 w-full text-base"
            variant={open ? 'destructive' : 'default'}
            disabled={pending}
            onClick={punch}
          >
            {pending
              ? 'Registrando...'
              : open
                ? 'Registrar salida'
                : 'Registrar entrada'}
          </Button>
          <ul className="m-0 list-none divide-y rounded-lg border p-0">
            {(data?.records ?? []).length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground">
                Aún no hay registros
              </li>
            ) : (
              data.records.map((record) => (
                <li
                  key={record._id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="text-sm font-medium">
                    {formatDate(record.date, 'es-MX')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(record.checkInAt)}
                    {' – '}
                    {record.checkOutAt ? formatTime(record.checkOutAt) : 'en turno'}
                  </span>
                </li>
              ))
            )}
          </ul>
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
    <Card as="section" className="gap-4 p-4 sm:p-6" aria-labelledby="attendance-title">
      <header>
        <h1 id="attendance-title" className="text-xl font-semibold">
          Asistencia
        </h1>
        <p className="text-sm text-muted-foreground">
          Entradas y salidas del personal
        </p>
      </header>
      <div className="max-w-xs">
        <Label htmlFor="attendance-date">Fecha</Label>
        <Input
          id="attendance-date"
          type="date"
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
            <li key={user._id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="break-words font-medium">{personName(user)}</p>
                <p className="text-xs text-muted-foreground">{user.username}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
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
  return <PageShell>{isAdmin ? <AdminBoard /> : <StaffClock />}</PageShell>
}

export default Attendance
