import { formatMoney, roundTo } from '@/utils/commonFunctions'
import { todayLocal } from '@/utils/dateDisplay'
import { lazy, Suspense, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useGetSalesByDateRangePages } from '@/features/inventory.features'
import { getSalesByDateRange } from '@/services/inventory.services'
import { useGetPaymentTypes } from '@/features/paymentTypes.features'
import Loading from '@/ui/Loading'
import { Button } from '@/components/ui/button'
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

const ReportsMovementsTable = lazy(() => import('./ReportsMovementsTable'))

const ALL_OPTION = 'all'

const COUNT_LABEL = (type) =>
  isExitType(type) ? 'Productos vendidos' : 'Productos ingresados'

const TOTAL_LABEL = (type) =>
  isExitType(type) ? 'Total de ventas' : 'Total de compras'

const ReportsSalesAndMovements = () => {
  const { data: paymentTypes } = useGetPaymentTypes()
  const [startDate, setStartDate] = useState(todayLocal())
  const [endDate, setEndDate] = useState(todayLocal())
  const { types, issueType } = useGetTypeInventories()
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
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useGetSalesByDateRangePages(
    startDate,
    endDate,
    selectedType,
    selectedPaymentType,
    typeChoice !== undefined || Boolean(issueType)
  )

  const filteredRecords = useMemo(
    () => salesPages?.pages.flatMap((page) => page.data) || [],
    [salesPages]
  )
  const totalRecords = salesPages?.pages[0]?.total ?? 0
  const summary = salesPages?.pages[0]?.summary

  const totalCards = useMemo(
    () =>
      types
        .filter((type) => !selectedType || type.value === selectedType)
        .map((type) => ({
          label: TOTAL_LABEL(type),
          type: type.value,
          amount: roundTo(summary?.[type.value]?.totalAmount, 2)
        })),
    [types, selectedType, summary]
  )

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
        `reporte-movimientos_${startDate}_${endDate}.xlsx`
      )
    } catch {
      toast.error('No se pudo exportar el reporte a Excel')
    } finally {
      setIsExporting(false)
    }
  }

  if (salesLoading) return <Loading fullScreen={false} />

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
          <Button
            type="button"
            onClick={handleExport}
            disabled={isDateRangeInvalid || isExporting || totalRecords === 0}
          >
            {isExporting ? 'Exportando...' : 'Exportar a Excel'}
          </Button>
        </header>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-2">
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
          <div className="flex flex-col gap-2">
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
          {showPaymentFilter && (
            <div className="flex min-w-[200px] flex-col gap-2">
              <Label htmlFor="report-payment">Forma de pago</Label>
              <Select
                value={selectedPaymentType || ALL_OPTION}
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
          )}
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
              className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]"
            >
              {totalCards.map((card) => (
                <Card key={card.type} className="gap-2 p-6">
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    {card.label}
                  </h2>
                  <strong className="text-3xl text-emerald-400">
                    {formatMoney(card.amount)}
                  </strong>
                </Card>
              ))}
              {selectedType && (
                <Card className="gap-2 p-6">
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    {COUNT_LABEL(selectedTypeInfo)}
                  </h2>
                  <strong className="text-3xl text-primary">
                    {summary?.[selectedType]?.products ?? 0}
                  </strong>
                </Card>
              )}
            </section>

            <Suspense fallback={<Loading fullScreen={false} />}>
              <ReportsMovementsTable
                records={filteredRecords}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            </Suspense>
          </>
        )}
      </Card>
    </section>
  )
}

export default ReportsSalesAndMovements
