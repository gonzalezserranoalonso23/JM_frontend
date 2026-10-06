import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useGetDailyInformations } from '@/features/dailyInformation.features'
import Loading from '@/ui/Loading'

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

const formatAmount = (amount) => `$${Number(amount || 0).toFixed(2)}`

const DailyInformationDashboard = () => {
  const { data: records, isLoading, isError } = useGetDailyInformations()
  const [selectedId, setSelectedId] = useState('')
  const currentDate = new Date()
  const today = [
    currentDate.getFullYear(),
    String(currentDate.getMonth() + 1).padStart(2, '0'),
    String(currentDate.getDate()).padStart(2, '0')
  ].join('-')
  const orderedRecords = (records || [])
    .filter((record) => {
      const recordDate = String(record?.date || '').slice(0, 10)
      return /^\d{4}-\d{2}-\d{2}$/.test(recordDate) && recordDate < today
    })
    .sort((first, second) =>
      String(second.date).localeCompare(String(first.date))
    )
  const selectedRecord =
    orderedRecords.find((record) => record._id === selectedId) ||
    orderedRecords[0]

  return (
    <section className="dashboard-card home-dashboard-card mb-8 rounded-xl border border-slate-200 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Información diaria
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Consulta los totales de días anteriores
          </p>
        </div>
        {!isLoading && !isError && orderedRecords.length > 0 && (
          <div className="w-full sm:w-64">
            <label
              htmlFor="daily-information-date"
              className="mb-1 block text-sm font-medium text-slate-600"
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
      </div>

      {isLoading ? (
        <Loading fullScreen={false} />
      ) : isError ? (
        <p className="text-sm text-red-700">
          No se pudo cargar la información diaria.
        </p>
      ) : selectedRecord ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0 py-2">
            <p className="text-sm font-medium text-slate-500">Efectivo</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {formatAmount(selectedRecord.cashSales)}
            </p>
          </div>
          <div className="min-w-0 py-2">
            <p className="text-sm font-medium text-slate-500">Tarjeta</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {formatAmount(selectedRecord.cardSales)}
            </p>
          </div>
          <div className="min-w-0 py-2">
            <p className="text-sm font-medium text-slate-500">Ventas totales</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {formatAmount(selectedRecord.totalSales)}
            </p>
          </div>
          <div className="min-w-0 py-2">
            <p className="text-sm font-medium text-slate-500">Transacciones</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {selectedRecord.totalTransactions ?? 0}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No hay información diaria registrada antes de hoy.
        </p>
      )}
    </section>
  )
}

export default DailyInformationDashboard
