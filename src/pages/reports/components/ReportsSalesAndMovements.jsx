import { formatMoney, roundTo } from '@/utils/commonFunctions'
import { todayLocal } from '@/utils/dateDisplay'
import { useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useGetSalesByDateRangePages } from '@/features/inventory.features'
import { getSalesByDateRange } from '@/services/inventory.services'
import { useGetPaymentTypes } from '@/features/paymentTypes.features'
import ListSkeleton from '@/components/ListSkeleton'
import Skeleton from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { useGetTypeInventories } from '@/features/typeInventory.features'
import { isExitType } from '@/utils/typeInventory'
import ReportsMovementsTable from './ReportsMovementsTable'

const ALL_OPTION = 'all'

const ReportsSalesAndMovements = () => {
  const { data: paymentTypes } = useGetPaymentTypes()
  const [startDate, setStartDate] = useState(todayLocal())
  const [endDate, setEndDate] = useState(todayLocal())
  const { types, issueType, entryType } = useGetTypeInventories()
  // undefined = aún sin elegir: por defecto las salidas; '' = todos
  const [typeChoice, setTypeChoice] = useState()
  const selectedType = typeChoice ?? issueType?.value ?? ''
  const selectedTypeInfo = types.find((type) => type.value === selectedType)
  const [paymentChoice, setPaymentChoice] = useState('')
  // Las entradas no tienen forma de pago: el filtro solo aplica a salidas/todos
  const showPaymentFilter = selectedTypeInfo?.stockDirection !== 1
  const selectedPaymentType = showPaymentFilter ? paymentChoice : ''
  const [isExporting, setIsExporting] = useState(false)
  const isDateRangeInvalid =
    Boolean(startDate && endDate) && startDate > endDate
  const {
    data: salesPages,
    isLoading: salesLoading,
    isPlaceholderData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching
  } = useGetSalesByDateRangePages(
    startDate,
    endDate,
    selectedType,
    selectedPaymentType,
    typeChoice !== undefined || Boolean(issueType)
  )
  const waitingForDefault = typeChoice === undefined && !issueType
  const pending =
    !isDateRangeInvalid &&
    (salesLoading || isPlaceholderData || waitingForDefault)

  const filteredRecords = useMemo(() => {
    if (pending) return []
    return salesPages?.pages.flatMap((page) => page.data) || []
  }, [pending, salesPages])
  const totalRecords = pending ? 0 : (salesPages?.pages[0]?.total ?? 0)
  const summary = pending ? null : salesPages?.pages[0]?.summary

  const showProfit = !selectedTypeInfo || isExitType(selectedTypeInfo)
  const profitTotal = roundTo(
    types
      .filter(
        (type) =>
          isExitType(type) && (!selectedType || type.value === selectedType)
      )
      .reduce(
        (sum, type) => sum + Number(summary?.[type.value]?.profit || 0),
        0
      ),
    2
  )
  const amountText = (amount) =>
    pending || amount == null ? '—' : formatMoney(roundTo(Number(amount), 2))
  const countText = (typeId) =>
    pending ? '—' : String(summary?.[typeId]?.products ?? 0)
  const summaryCards =
    !selectedType || waitingForDefault || isExitType(selectedTypeInfo)
      ? selectedType || waitingForDefault
        ? [
            {
              label: 'Total de ventas',
              value: amountText(summary?.[selectedType]?.totalAmount)
            },
            { label: 'Utilidad', value: amountText(profitTotal) },
            { label: 'Productos vendidos', value: countText(selectedType) }
          ]
        : [
            {
              label: 'Total de compras',
              value: amountText(summary?.[entryType?.value]?.totalAmount)
            },
            {
              label: 'Total de ventas',
              value: amountText(summary?.[issueType?.value]?.totalAmount)
            },
            { label: 'Utilidad', value: amountText(profitTotal) }
          ]
      : [
          {
            label: 'Total de compras',
            value: amountText(summary?.[selectedType]?.totalAmount)
          },
          { label: 'Utilidad', value: '—' },
          { label: 'Productos ingresados', value: countText(selectedType) }
        ]

  const handleExport = async () => {
    if (isDateRangeInvalid) return

    setIsExporting(true)
    try {
      const [{ allRecords = [] }, { exportMovementsToExcel }] =
        await Promise.all([
          getSalesByDateRange(
            startDate,
            endDate,
            selectedPaymentType,
            selectedType
          ),
          import('@/utils/exportExcel')
        ])
      await exportMovementsToExcel(
        allRecords,
        `reporte-movimientos_${startDate}_${endDate}.xlsx`,
        { includeProfit: showProfit }
      )
    } catch {
      toast.error('No se pudo exportar el reporte a Excel')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <section aria-labelledby="reports-title">
      <Card className="p-4 sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 id="reports-title" className="text-xl font-bold">
              Reportes
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Movimientos y ventas por período
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Actualizar"
                  onClick={() => refetch()}
                  disabled={isDateRangeInvalid || isRefetching}
                >
                  <RefreshCw
                    className={isRefetching ? 'animate-spin' : undefined}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Actualizar</TooltipContent>
            </Tooltip>
            <Button
              type="button"
              onClick={handleExport}
              disabled={isDateRangeInvalid || isExporting || totalRecords === 0}
            >
              {isExporting ? 'Exportando...' : 'Exportar a Excel'}
            </Button>
          </div>
        </header>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-52">
            <Label htmlFor="report-start-date">Desde</Label>
            <Input
              id="report-start-date"
              type="date"
              aria-invalid={isDateRangeInvalid}
              aria-describedby={
                isDateRangeInvalid ? 'report-date-error' : undefined
              }
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-52">
            <Label htmlFor="report-end-date">Hasta</Label>
            <Input
              id="report-end-date"
              type="date"
              aria-invalid={isDateRangeInvalid}
              aria-describedby={
                isDateRangeInvalid ? 'report-date-error' : undefined
              }
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex min-w-[200px] flex-col gap-2">
            <Label htmlFor="report-type">Tipo de movimiento</Label>
            <Select
              value={selectedType || ALL_OPTION}
              onValueChange={(value) =>
                setTypeChoice(value === ALL_OPTION ? '' : value)
              }
            >
              <SelectTrigger id="report-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_OPTION}>Todos</SelectItem>
                {types.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex min-w-[200px] flex-col gap-2">
            <Label htmlFor="report-payment">Forma de pago</Label>
            <Select
              value={
                showPaymentFilter
                  ? selectedPaymentType || ALL_OPTION
                  : ALL_OPTION
              }
              disabled={!showPaymentFilter}
              onValueChange={(value) =>
                setPaymentChoice(value === ALL_OPTION ? '' : value)
              }
            >
              <SelectTrigger id="report-payment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_OPTION}>Todas</SelectItem>
                {paymentTypes.map((payment) => (
                  <SelectItem key={payment.value} value={payment.value}>
                    {payment.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {isDateRangeInvalid && (
          <p id="report-date-error" role="alert" className="text-destructive">
            La fecha de inicio no puede ser posterior a la fecha final.
          </p>
        )}

        {!isDateRangeInvalid && (
          <>
            <section
              aria-label="Resumen del período"
              className="grid gap-4 sm:grid-cols-3"
            >
              {summaryCards.map((card) => (
                <Card key={card.label} className="gap-2 p-6">
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    {card.label}
                  </h2>
                  {pending ? (
                    <Skeleton className="h-9 w-36" />
                  ) : (
                    <strong className="text-3xl tabular-nums text-emerald-400">
                      {card.value}
                    </strong>
                  )}
                </Card>
              ))}
            </section>

            {pending ? (
              <ListSkeleton />
            ) : (
              <ReportsMovementsTable
                records={filteredRecords}
                showProfit={showProfit}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            )}
          </>
        )}
      </Card>
    </section>
  )
}

export default ReportsSalesAndMovements
