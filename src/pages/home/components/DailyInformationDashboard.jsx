import { useState } from 'react'
import { Input } from '@/components/atoms/input'
import { useGetDailyInformation } from '@/features/dailyInformation.features'
import { formatMoney } from '@/utils/commonFunctions'
import { yesterdayMexicoCity } from '@/utils/dateDisplay'
import { SalesCard, SalesFigures } from './SalesCard'

const START_DATE = '2026-10-01'

const DailyInformationDashboard = () => {
  const yesterday = yesterdayMexicoCity()
  const [date, setDate] = useState(yesterday)
  const selected = date > yesterday ? yesterday : date
  const { data: record, isLoading, isError } = useGetDailyInformation(selected)

  return (
    <SalesCard
      id="daily-summary-title"
      title="Ventas anteriores"
      headerClassName="w-full flex-row items-center justify-between gap-3"
      aside={
        <div className="w-48 shrink-0">
          <Input
            id="daily-information-date"
            aria-label="Fecha"
            className="h-7 py-0 text-sm"
            style={{ height: '28px', minHeight: '28px' }}
            type="date"
            min={START_DATE}
            max={yesterday}
            value={selected}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
      }
    >
      {isError && (
        <p className="mb-4 text-sm text-destructive">
          No se pudieron cargar las ventas anteriores.
        </p>
      )}
      {!isLoading && !isError && !record && (
        <p className="mb-4 text-sm text-muted-foreground">
          No hay ventas anteriores para esta fecha.
        </p>
      )}
      <SalesFigures
        loading={isLoading}
        items={[
          {
            label: 'Ventas totales',
            value: record ? formatMoney(record.totalSales) : '—'
          },
          {
            label: 'Efectivo',
            value: record ? formatMoney(record.cashSales) : '—'
          },
          {
            label: 'Tarjeta',
            value: record ? formatMoney(record.cardSales) : '—'
          },
          {
            label: 'Transacciones',
            value: record ? (record.totalTransactions ?? 0) : '—'
          }
        ]}
      />
    </SalesCard>
  )
}

export default DailyInformationDashboard
