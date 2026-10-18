import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetDailyInformations } from '@/features/dailyInformation.features'
import Loading from '@/ui/Loading'
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
    <Card className="mb-8" aria-labelledby="daily-summary-title" role="region">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <CardTitle>
          <h2 id="daily-summary-title" className="text-xl font-semibold">
            Información diaria
          </h2>
        </CardTitle>
        {!isLoading && !isError && orderedRecords.length > 0 && (
          <div className="w-full sm:w-64">
            <label
              htmlFor="daily-information-date"
              className="mb-1 block text-sm font-medium text-muted-foreground"
            >
              Fecha
            </label>
            <Select
              value={selectedRecord?._id || ''}
              onValueChange={setSelectedId}
            >
              <SelectTrigger id="daily-information-date">
                <SelectValue placeholder="Selecciona una fecha" />
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
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Loading fullScreen={false} />
        ) : isError ? (
          <p className="text-sm text-destructive">
            No se pudo cargar la información diaria.
          </p>
        ) : selectedRecord ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Efectivo', formatAmount(selectedRecord.cashSales)],
              ['Tarjeta', formatAmount(selectedRecord.cardSales)],
              ['Ventas totales', formatAmount(selectedRecord.totalSales)],
              ['Transacciones', selectedRecord.totalTransactions ?? 0]
            ].map(([label, value]) => (
              <div key={label} className="min-w-0 py-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {label}
                </p>
                <p className="mt-3 text-2xl font-bold text-foreground">
                  {value}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay información diaria registrada desde el 1 de octubre de 2026.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default DailyInformationDashboard
