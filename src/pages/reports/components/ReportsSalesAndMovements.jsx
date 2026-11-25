import { useState } from 'react'
import { useGetDailyInformationPages } from '@/features/dailyInformation.features'
import { Alert } from '@/components/atoms/alert'
import { Card } from '@/components/atoms/card'
import ListSkeleton from '@/components/molecules/ListSkeleton'
import TableDailyInformation from '@/pages/daily-information/components/TableDailyInformation'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Button } from '@/components/atoms/button'
import { notifyError } from '@/libs/handleErrors'
import { todayLocal } from '@/utils/dateDisplay'
import { getAllDailyInformations } from '@/services/dailyInformation.services'

const ReportsSalesAndMovements = () => {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const invalidRange = Boolean(from && to && from > to)
  const hasFilters = Boolean(from || to)
  const {
    data: recordPages,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetDailyInformationPages('', !invalidRange, from, to)
  const records = recordPages?.pages.flatMap((page) => page.data) || []
  const total = recordPages?.pages[0]?.total || 0

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const { exportDailyInformationToExcel } = await import(
        '@/utils/exportExcel'
      )
      const rows = await getAllDailyInformations({ from, to })
      await exportDailyInformationToExcel(
        rows,
        `ventas_${todayLocal()}.xlsx`
      )
    } catch (error) {
      notifyError(error, 'No se pudo exportar el reporte de ventas a Excel')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <section aria-labelledby="reports-title">
      <Card as="section" className="p-4 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 id="reports-title" className="text-xl font-bold">
            Ventas
          </h1>
          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            disabled={isLoading || isError || isExporting || total === 0}
          >
            {isExporting ? 'Exportando...' : 'Exportar a Excel'}
          </Button>
        </header>

        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-48">
            <Label className="mb-1" htmlFor="reports-from">
              Desde
            </Label>
            <Input
              id="reports-from"
              type="date"
              className="h-7 py-0 text-base"
              style={{ height: '28px', minHeight: '28px' }}
              value={from}
              aria-invalid={invalidRange}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Label className="mb-1" htmlFor="reports-to">
              Hasta
            </Label>
            <Input
              id="reports-to"
              type="date"
              className="h-7 py-0 text-base"
              style={{ height: '28px', minHeight: '28px' }}
              value={to}
              aria-invalid={invalidRange}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              disabled={!hasFilters}
              onClick={() => {
                setFrom('')
                setTo('')
              }}
            >
              Borrar filtros
            </Button>
          </div>
        </div>

        {invalidRange ? (
          <Alert variant="destructive">
            La fecha Desde no puede ser mayor que la fecha Hasta.
          </Alert>
        ) : isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <Alert variant="destructive">
            Error al cargar la información de ventas
          </Alert>
        ) : records.length ? (
          <TableDailyInformation
            records={records}
            total={total}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        ) : (
          <Alert className="text-amber-400">
            No hay información de ventas registrada
          </Alert>
        )}
      </Card>
    </section>
  )
}

export default ReportsSalesAndMovements
