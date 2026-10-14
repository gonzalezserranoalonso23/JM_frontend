import { formatDate, todayLocal } from '@/utils/dateDisplay'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useGetSalesByDateRangePages } from '@/features/inventory.features'
import { getSalesByDateRange } from '@/services/inventory.services'
import useIntersectionPagination from '@/hooks/useIntersectionPagination'
import { exportMovementsToExcel } from '@/utils/exportExcel'
import { useGetPaymentTypes } from '@/features/paymentTypes.features'
import Loading from '@/ui/Loading'
import '../../../styles/inventory.css'
import { useGetTypeInventories } from '@/features/typeInventory.features'

const isExitType = (type) => type?.stockDirection === -1

const COUNT_LABEL = (type) =>
  isExitType(type) ? 'Productos vendidos' : 'Productos ingresados'

const TOTAL_LABEL = (type) =>
  isExitType(type) ? 'Total de ventas' : 'Total de compras'

const ReportsSalesAndMovements = () => {
  const { data: paymentTypes } = useGetPaymentTypes()
  const [startDate, setStartDate] = useState(todayLocal(-1))
  const [endDate, setEndDate] = useState(todayLocal(-1))
  const { types, issueType } = useGetTypeInventories()
  // undefined = aún sin elegir: por defecto las salidas; '' = todos
  const [typeChoice, setTypeChoice] = useState()
  const selectedType = typeChoice ?? issueType?.value ?? ''
  const selectedTypeInfo = types.find((type) => type.value === selectedType)
  const [selectedPaymentType, setSelectedPaymentType] = useState('')
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
    selectedPaymentType
  )
  const { sentinelRef, supportsIntersectionObserver } =
    useIntersectionPagination(fetchNextPage, hasNextPage && !isFetchingNextPage)

  if (salesLoading) return <Loading />

  const filteredRecords = salesPages?.pages.flatMap((page) => page.data) || []
  const totalRecords = salesPages?.pages[0]?.total ?? 0
  const summary = salesPages?.pages[0]?.summary

  const sumByType = (type) => Number(summary?.[type]?.totalAmount || 0)

  // Con "Todos" se separan para no mezclar entradas con salidas en un solo total
  const totalCards = types
    .filter((type) => !selectedType || type.value === selectedType)
    .map((type) => ({ label: TOTAL_LABEL(type), type: type.value }))

  const handleExport = async () => {
    if (isDateRangeInvalid) return

    setIsExporting(true)
    try {
      const { allRecords = [] } = await getSalesByDateRange(
        startDate,
        endDate,
        selectedPaymentType
      )
      const records = allRecords.filter(
        (r) => !selectedType || r.typeInventory?._id === selectedType
      )
      await exportMovementsToExcel(
        records,
        `reporte-movimientos_${startDate}_${endDate}.xlsx`
      )
    } catch {
      toast.error('No se pudo exportar el reporte a Excel')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <section className="section-container" aria-labelledby="reports-title">
      <header className="section-header">
        <div>
          <h1
            id="reports-title"
            style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#111827',
              margin: 0
            }}
          >
            Reportes
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: '0.25rem 0 0 0'
            }}
          >
            Movimientos y ventas por período
          </p>
        </div>
        <button
          type="button"
          className="btn-custom btn-primary-custom"
          onClick={handleExport}
          disabled={isDateRangeInvalid || isExporting || totalRecords === 0}
        >
          {isExporting ? 'Exportando...' : 'Exportar a Excel'}
        </button>
      </header>

      {/* Filtros */}
      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="report-start-date">Desde</label>
          <input
            id="report-start-date"
            type="date"
            className="form-control"
            aria-invalid={isDateRangeInvalid}
            aria-describedby={
              isDateRangeInvalid ? 'report-date-error' : undefined
            }
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="report-end-date">Hasta</label>
          <input
            id="report-end-date"
            type="date"
            className="form-control"
            aria-invalid={isDateRangeInvalid}
            aria-describedby={
              isDateRangeInvalid ? 'report-date-error' : undefined
            }
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Tipo de movimiento</label>
          <select
            value={selectedType}
            onChange={(e) => setTypeChoice(e.target.value)}
            className="form-select"
          >
            <option value="">Todos</option>
            {types.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Forma de pago</label>
          <select
            value={selectedPaymentType}
            onChange={(e) => setSelectedPaymentType(e.target.value)}
            className="form-select"
          >
            <option value="">Todas</option>
            {paymentTypes.map((payment) => (
              <option key={payment.value} value={payment.value}>
                {payment.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {isDateRangeInvalid && (
        <p
          id="report-date-error"
          role="alert"
          style={{
            color: '#b91c1c',
            marginTop: '-0.75rem',
            marginBottom: '1rem'
          }}
        >
          La fecha de inicio no puede ser posterior a la fecha final.
        </p>
      )}

      {!isDateRangeInvalid && (
        <>
          {/* Cards de Resumen */}
          <section
            aria-label="Resumen del período"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}
          >
            {totalCards.map((card) => (
              <article
                key={card.type}
                style={{
                  padding: '1.5rem',
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <h2
                  style={{
                    color: '#7f8c8d',
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}
                >
                  {card.label}
                </h2>
                <strong style={{ fontSize: '1.75rem', color: '#27ae60' }}>
                  ${sumByType(card.type).toFixed(2)}
                </strong>
              </article>
            ))}
            {selectedType && (
              <article
                style={{
                  padding: '1.5rem',
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <h2
                  style={{
                    color: '#7f8c8d',
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}
                >
                  {COUNT_LABEL(selectedTypeInfo)}
                </h2>
                <strong style={{ fontSize: '1.75rem', color: '#3498db' }}>
                  {summary?.[selectedType]?.products ?? 0}
                </strong>
              </article>
            )}
          </section>

          {/* Tabla de Movimientos */}
          <div className="table-wrapper">
            <table className="table-minimal">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Forma de pago</th>
                  <th style={{ textAlign: 'center' }}>Cantidad</th>
                  <th style={{ textAlign: 'right' }}>Precio Unit.</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => {
                    return (
                      <tr key={record._id}>
                        <td>{formatDate(record.date)}</td>
                        <td>
                          <strong>{record.productName?.productName}</strong>
                        </td>
                        <td>
                          <span
                            className={`badge-minimal ${isExitType(record.typeInventory) ? 'badge-danger' : 'badge-success'}`}
                          >
                            {record.typeInventory?.typeInventory}
                          </span>
                        </td>
                        <td>{record.paymentType?.paymentType || '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          {record.quantity}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          ${parseFloat(record.productPrice).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <strong>
                            ${parseFloat(record.totalAmount).toFixed(2)}
                          </strong>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: '#7f8c8d'
                      }}
                    >
                      No hay movimientos en este período
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {hasNextPage && supportsIntersectionObserver && (
              <div ref={sentinelRef} className="h-1" aria-hidden="true" />
            )}
            {isFetchingNextPage && supportsIntersectionObserver && (
              <Loading fullScreen={false} />
            )}
            {hasNextPage && !supportsIntersectionObserver && (
              <button
                type="button"
                className="w-full py-3 text-sm font-medium"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <Loading fullScreen={false} />
                ) : (
                  'Cargar más'
                )}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default ReportsSalesAndMovements
