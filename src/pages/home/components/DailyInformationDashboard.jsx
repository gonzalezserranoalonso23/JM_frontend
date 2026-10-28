import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Skeleton from '@/components/ui/skeleton'
import { useGetDailyInformations } from '@/features/dailyInformation.features'
import { formatDate as displayDate, isoDay } from '@/utils/dateDisplay'

const START_DATE = '2026-10-01'

const formatDate = (date) =>
  displayDate(date, 'es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

const formatAmount = (amount) => `$${Number(amount || 0).toFixed(2)}`

const DailyInformationDashboard = () => {
  const { data: records, isLoading, isError } = useGetDailyInformations()
  const [selectedId, setSelectedId] = useState('')
  const orderedRecords = (records || [])
    .filter((record) => {
      const date = isoDay(record?.date)
      return date >= START_DATE
    })
    .sort((first, second) =>
      isoDay(second.date).localeCompare(isoDay(first.date))
    )
  const selectedRecord =
    orderedRecords.find((record) => record._id === selectedId) ||
    orderedRecords[0]

  return (
    <Card as="section" className="mb-6" aria-labelledby="daily-summary-title">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>
          <h2 id="daily-summary-title" className="text-xl font-semibold">
            Información ventas
          </h2>
        </CardTitle>
        <div className="w-full sm:w-64 sm:shrink-0">
          <label
            htmlFor="daily-information-date"
            className="mb-1 block text-sm font-medium text-muted-foreground"
          >
            Fecha
          </label>
          <Select
            value={selectedRecord?._id || ''}
            onValueChange={setSelectedId}
            disabled={isLoading || isError || orderedRecords.length === 0}
          >
            <SelectTrigger id="daily-information-date">
              <SelectValue
                placeholder={isLoading ? 'Cargando...' : 'Selecciona una fecha'}
              />
            </SelectTrigger>
            <SelectContent>
              {orderedRecords.map((record) => (
                <SelectItem key={record._id} value={record._id}>
                  {formatDate(record.date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isError && (
          <p className="mb-3 text-sm text-destructive">
            No se pudo cargar la información diaria.
          </p>
        )}
        {!isLoading && !isError && !selectedRecord && (
          <p className="mb-3 text-sm text-muted-foreground">
            No hay información diaria registrada desde el 1 de octubre de 2026.
          </p>
        )}
        <dl className="grid min-h-24 grid-cols-1 gap-4 sm:grid-cols-4">
          {[
            [
              'Ventas totales',
              selectedRecord ? formatAmount(selectedRecord.totalSales) : '—'
            ],
            [
              'Efectivo',
              selectedRecord ? formatAmount(selectedRecord.cashSales) : '—'
            ],
            [
              'Tarjeta',
              selectedRecord ? formatAmount(selectedRecord.cardSales) : '—'
            ],
            [
              'Transacciones',
              selectedRecord ? (selectedRecord.totalTransactions ?? 0) : '—'
            ]
          ].map(([label, value]) => (
            <div key={label} className="min-w-0 py-2">
              <dt className="text-sm font-medium text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-3 text-2xl font-bold text-foreground tabular-nums">
                {isLoading ? <Skeleton className="h-8 w-28" /> : value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

export default DailyInformationDashboard
