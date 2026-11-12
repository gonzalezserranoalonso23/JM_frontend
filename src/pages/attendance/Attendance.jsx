import { useEffect, useRef, useState } from 'react'
import PageShell from '@/components/templates/PageShell'
import { Alert } from '@/components/atoms/alert'
import { Button } from '@/components/atoms/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/atoms/card'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import Skeleton from '@/components/atoms/skeleton'
import useIntersectionPagination from '@/hooks/useIntersectionPagination'
import { hasFullAccess } from '@/auth/access'
import { useRoleName } from '@/features/users.features'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/atoms/select'
import { formatMoney } from '@/utils/commonFunctions'
import { todayMexicoCity } from '@/utils/dateDisplay'
import {
  ALL_USERS,
  attendanceDay,
  attendancePages,
  attendanceRows,
  formatDay,
  formatNow,
  formatTime,
  moneyOrDash,
  paidToSuppliers,
  paymentLabel,
  personName,
  punchCopy,
  punchVariant,
  recordEnd
} from '@/utils/attendance'
import {
  useMyAttendance,
  useAttendanceDay,
  useCheckIn,
  useCheckOut
} from '@/features/attendance.features'
import ListSkeleton from '@/components/molecules/ListSkeleton'
import { useGetSuppliers } from '@/features/suppliers.features'
import { useShiftPayments } from '@/store/shiftPayments'
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
  dayOff,
  onPunch
}) => {
  const shiftId = open?._id ? String(open._id) : ''
  const seenShift = useRef(null)
  const [amount, setAmount] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const { payments, addPayment, removePayment, clearShift } =
    useShiftPayments(shiftId)
  const { data: suppliers } = useGetSuppliers({ enabled: Boolean(open) })

  useEffect(() => {
    if (seenShift.current === shiftId) return
    if (seenShift.current) clearShift(seenShift.current)
    seenShift.current = shiftId
    setAmount('')
    setSupplierId('')
    setPaymentAmount('')
  }, [shiftId, clearShift])

  const parsedAmount = Number(amount)
  const amountReady =
    amount.trim() !== '' && Number.isFinite(parsedAmount) && parsedAmount >= 0
  const parsedPayment = Number(paymentAmount)
  const paymentReady =
    supplierId !== '' &&
    paymentAmount.trim() !== '' &&
    Number.isFinite(parsedPayment) &&
    parsedPayment >= 0
  const askCash = loaded && !dayOff
  const supplierOptions = (suppliers ?? []).filter(
    (supplier) => supplier.isActive !== false
  )
  const addSupplierPayment = () => {
    if (!paymentReady || !shiftId) return
    addPayment(shiftId, { supplier: supplierId, amount: parsedPayment })
    setSupplierId('')
    setPaymentAmount('')
  }
  const removeSupplierPayment = (index) => {
    removePayment(shiftId, index)
  }
  let cashLabel = 'Lo que recibes en caja'
  if (open) cashLabel = 'Dinero del corte'

  if (failed) {
    return <Alert variant="destructive">No se pudo cargar tu asistencia</Alert>
  }
  if (!loaded) {
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
        <LiveClock />
        {staleOpen}
      </div>
      {askCash && (
        <div className="grid gap-1.5">
          <Label htmlFor="attendance-cash">{cashLabel}</Label>
          <Input
            id="attendance-cash"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>
      )}
      {open && askCash && (
        <div className="grid gap-2">
          <Label htmlFor="attendance-supplier">Pagos a proveedores</Label>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-end">
            <Select
              value={supplierId || undefined}
              onValueChange={setSupplierId}
            >
              <SelectTrigger id="attendance-supplier">
                <SelectValue placeholder="Proveedor" />
              </SelectTrigger>
              <SelectContent>
                {supplierOptions.map((supplier) => (
                  <SelectItem key={supplier._id} value={supplier._id}>
                    {supplier.suppliersName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="attendance-payment"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="Cantidad"
              aria-label="Cantidad pagada"
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              disabled={!paymentReady}
              onClick={addSupplierPayment}
            >
              Agregar
            </Button>
          </div>
          {payments.length > 0 && (
            <ul className="m-0 list-none space-y-1 p-0 text-sm">
              {payments.map((payment, index) => (
                <li
                  key={`${payment.supplier}-${index}`}
                  className="flex items-center justify-between gap-2"
                >
                  <span>
                    {supplierOptions.find(
                      (item) => item._id === payment.supplier
                    )?.suppliersName || 'Proveedor'}{' '}
                    {formatMoney(payment.amount)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSupplierPayment(index)}
                  >
                    Quitar
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-sm font-medium">
            Total pagado {formatMoney(paidToSuppliers(payments))}
          </p>
        </div>
      )}
      <Button
        type="button"
        className="h-12 w-full text-base xl:w-fit xl:min-w-48 xl:px-8"
        variant={punchVariant(open)}
        disabled={pending || dayOff || (askCash && !amountReady)}
        onClick={() => onPunch({ amount: parsedAmount, payments })}
      >
        {punchCopy({ pending, open, dayOff })}
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
                {' · Caja '}
                {moneyOrDash(record.cashReceived)}
                {' · Corte '}
                {moneyOrDash(record.cashCut)}
              </span>
            </div>
            {(record.supplierPayments ?? []).length > 0 && (
              <p className="text-sm text-muted-foreground">
                {paymentLabel(record.supplierPayments)}
              </p>
            )}
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
    workDay,
    records: loadedRecords
  } = attendancePages(data)
  const records = rangeInvalid ? [] : loadedRecords
  const listPending =
    !rangeInvalid &&
    (isLoading || (isPlaceholderData && isFetching && !isFetchingNextPage))
  const today = todayMexicoCity()
  const pending = checkIn.isPending || checkOut.isPending
  const dayOff = !open && !workDay

  const punch = ({ amount, payments }) =>
    confirmPunch({ open, dayOff, amount, payments, checkIn, checkOut })

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
    <div className="grid gap-4">
      {rows.map((row) => (
        <Card
          key={row.key}
          className="gap-0 border-foreground/25 bg-muted py-0 shadow-md dark:border-foreground/30 dark:bg-[oklch(0.34_0_0)]"
        >
          <CardHeader className="border-b border-foreground/15 py-4">
            <CardTitle>
              <h2 className="text-base">{row.name}</h2>
            </CardTitle>
            <p className="text-sm text-muted-foreground">{row.username}</p>
          </CardHeader>
          <CardContent className="py-4">
            {row.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin pagos a proveedores
              </p>
            ) : (
              <>
                <ul className="m-0 list-none space-y-2 p-0">
                  {row.payments.map((payment) => (
                    <li
                      key={payment.key}
                      className="flex items-baseline justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 break-words">
                        {payment.name}
                      </span>
                      <span className="shrink-0 tabular-nums">
                        {payment.amount}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-foreground/15 pt-3 text-sm font-semibold">
                  <span>Total</span>
                  <span className="shrink-0 tabular-nums">{row.total}</span>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-3 border-t border-foreground/15 py-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Entrada</p>
              <p>{row.start}</p>
              <p className="text-muted-foreground">Recibido {row.received}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Salida</p>
              <p>{row.end}</p>
              <p className="text-muted-foreground">Corte {row.cut}</p>
            </div>
          </CardFooter>
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

export const AttendancePunch = () => {
  const { data, isError } = useMyAttendance()
  const checkIn = useCheckIn()
  const checkOut = useCheckOut()
  const { loaded, open, workDay } = attendancePages(data)
  const today = todayMexicoCity()
  const pending = checkIn.isPending || checkOut.isPending
  const dayOff = !open && !workDay

  return (
    <section aria-labelledby="profile-punch" className="grid gap-3">
      <h2 id="profile-punch" className="text-sm font-semibold">
        Asistencia
      </h2>
      <ClockPanel
        failed={isError && !loaded}
        loaded={loaded}
        open={open}
        today={today}
        pending={pending}
        dayOff={dayOff}
        onPunch={({ amount, payments }) =>
          confirmPunch({ open, dayOff, amount, payments, checkIn, checkOut })
        }
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
