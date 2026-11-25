import { useEffect, useState } from 'react'
import PageShell from '@/components/templates/PageShell'
import { Alert } from '@/components/atoms/alert'
import { Button } from '@/components/atoms/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/atoms/card'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import Skeleton from '@/components/atoms/skeleton'
import useIntersectionPagination from '@/hooks/useIntersectionPagination'
import { hasFullAccess } from '@/auth/access'
import { useIsAdmin } from '@/features/users.features'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/atoms/select'
import { todayMexicoCity } from '@/utils/dateDisplay'
import {
  ALL_USERS,
  attendanceDay,
  attendancePages,
  attendanceRows,
  formatDay,
  formatNow,
  formatTime,
  personName,
  punchCopy,
  recordEnd
} from '@/utils/attendance'
import {
  useMyAttendance,
  useAttendanceDay,
  useCheckIn,
  useCheckOut
} from '@/features/attendance.features'
import ListSkeleton from '@/components/molecules/ListSkeleton'
import { confirmPunch } from './punch'

const LiveClock = () => {
  const [label, setLabel] = useState(formatNow)

  useEffect(() => {
    const timer = setInterval(() => setLabel(formatNow()), 1000)
    return () => clearInterval(timer)
  }, [])

  return <p className="text-sm text-muted-foreground">{label}</p>
}

const ClockPanel = ({
  failed,
  loaded,
  open,
  today,
  pending,
  onPunch
}) => {
  if (failed) {
    return <Alert variant="destructive">No se pudo cargar tu asistencia</Alert>
  }
  if (!loaded) {
    return (
      <div role="status" aria-label="Cargando" className="grid gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-9 w-full sm:w-40" />
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
      <div className="rounded-lg border bg-muted/30 px-3 py-2">
        <LiveClock />
        {staleOpen}
      </div>
      <Button
        type="button"
        variant={open ? 'destructive' : 'default'}
        className={
          open
            ? '!h-9 !min-h-9 w-fit px-3'
            : '!h-9 !min-h-9 w-fit bg-cyan-600 px-3 text-white hover:scale-105 hover:bg-cyan-400'
        }
        disabled={
          pending
        }
        onClick={onPunch}
      >
        {punchCopy({ pending, open })}
      </Button>
    </>
  )
}

const HistoryList = ({
  records,
  listPending,
  loaded,
  hasNextPage,
  supportsIntersectionObserver,
  sentinelRef,
  isFetchingNextPage,
  fetchNextPage
}) => {
  if (listPending || !loaded) return <RecordSkeleton />
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
          <li key={record._id} className="grid gap-1 px-4 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span className="text-sm font-medium">
                {formatDay(record.date)}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatTime(record.checkInAt)}
                {' – '}
                {recordEnd(record)}
              </span>
            </div>
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
  const {
    loaded,
    open,
    records: loadedRecords
  } = attendancePages(data)
  const records = rangeInvalid ? [] : loadedRecords
  const listPending =
    !rangeInvalid &&
    (isLoading || (isPlaceholderData && isFetching && !isFetchingNextPage))
  const today = todayMexicoCity()
  const pending = checkIn.isPending || checkOut.isPending

  const punch = () => confirmPunch({ open, checkIn, checkOut })

  const showHistory = !(isError && !data)

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
        failed={isError && !loaded}
        loaded={loaded}
        open={open}
        today={today}
        pending={pending}
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
                className="h-7 py-0 text-base"
                style={{ height: '28px', minHeight: '28px' }}
                value={from}
                onChange={(event) => setFrom(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="attendance-to">Hasta</Label>
              <Input
                id="attendance-to"
                type="date"
                className="h-7 py-0 text-base"
                style={{ height: '28px', minHeight: '28px' }}
                value={to}
                onChange={(event) => setTo(event.target.value)}
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto rounded-lg border">
            <HistoryList
              records={records}
              listPending={listPending}
              loaded={loaded}
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

const AttendanceCards = ({ rows }) => {
  if (rows.length === 0) return <Alert>Nadie trabaja este día</Alert>
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <Card
          key={row.key}
          className="gap-0 border-foreground/25 bg-muted py-0 shadow-md dark:border-foreground/30 dark:bg-[oklch(0.34_0_0)]"
        >
          <CardHeader className="gap-1 border-b border-foreground/15 px-3 py-2">
            <CardTitle>
              <h2 className="text-sm">{row.name}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 px-3 py-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Entrada</p>
              <p>{row.start}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Salida</p>
              <p>{row.end}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const AdminBoard = () => {
  const [date, setDate] = useState(todayMexicoCity())
  const [userId, setUserId] = useState(ALL_USERS)
  const { data, isLoading, isError, isPlaceholderData, isFetching } =
    useAttendanceDay(date)
  const { staff, records } = attendanceDay(data)
  const selectedUser =
    userId === ALL_USERS ||
    !data ||
    staff.some((user) => String(user._id) === userId)
      ? userId
      : ALL_USERS
  const rows = attendanceRows(staff, records, selectedUser)
  let body = (
    <div className={isPlaceholderData && isFetching ? 'opacity-60' : undefined}>
      <AttendanceCards rows={rows} />
    </div>
  )
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
            className="h-7 py-0 text-base"
            style={{ height: '28px', minHeight: '28px' }}
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
        <div className="grid w-full min-w-52 max-w-xs gap-2">
          <Label htmlFor="attendance-user">Usuario</Label>
          <Select value={selectedUser} onValueChange={setUserId}>
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

export const AttendancePunch = ({ showTitle = true }) => {
  const { data, isError } = useMyAttendance()
  const checkIn = useCheckIn()
  const checkOut = useCheckOut()
  const { loaded, open } = attendancePages(data)
  const today = todayMexicoCity()
  const pending = checkIn.isPending || checkOut.isPending

  return (
    <section
      aria-label={showTitle ? undefined : 'Registrar entrada'}
      aria-labelledby={showTitle ? 'profile-punch' : undefined}
      className="grid gap-4"
    >
      {showTitle && (
        <h2 id="profile-punch" className="text-sm font-semibold">
          Asistencia
        </h2>
      )}
      <ClockPanel
        failed={isError && !loaded}
        loaded={loaded}
        open={open}
        today={today}
        pending={pending}
        onPunch={() => confirmPunch({ open, checkIn, checkOut })}
      />
    </section>
  )
}

const StaffAttendance = () => (
  <PageShell>
    <div className="mx-auto w-full md:w-[50vw]">
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
  const isAdmin = useIsAdmin()

  if (hasFullAccess(isAdmin)) return <AdminAttendance />

  return <StaffAttendance />
}

export default Attendance
