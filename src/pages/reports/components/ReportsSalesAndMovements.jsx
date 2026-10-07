import { formatDate, todayLocal } from '@/utils/dateDisplay'
import { useState } from 'react'
import { useGetSalesByDateRange } from '@/features/inventory.features'
import Loading from '@/ui/Loading'
import '../../../styles/inventory.css'

const FILTER_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'ENTRY', label: 'Entradas' },
  { value: 'ISSUE', label: 'Salidas' }
]

const getTypeValue = (record) => {
  if (typeof record?.typeInventory === 'string') {
    return record.typeInventory.toUpperCase()
  }

  const legacy = record?.typeInventory?.typeInventory || ''
  const normalized = legacy.toLowerCase().trim()
  if (normalized.includes('salida') || normalized.includes('venta')) {
    return 'ISSUE'
  }

  return 'ENTRY'
}

const isExit = (typeStr = '') => typeStr === 'ISSUE'

const formatTypeLabel = (typeStr = '') => {
  if (typeStr === 'ISSUE') return 'ISSUE'
  return 'ENTRY'
}

const ReportsSalesAndMovements = () => {
  const [startDate, setStartDate] = useState(todayLocal(-7))
  const [endDate, setEndDate] = useState(todayLocal())
  const [selectedType, setSelectedType] = useState('')

  const { data: salesData, isLoading: salesLoading } = useGetSalesByDateRange(
    startDate,
    endDate
  )

  if (salesLoading) return <Loading />

  const allRecords = salesData?.allRecords || []

  const filteredRecords = allRecords.filter((r) => {
    const typeName = getTypeValue(r)
    if (selectedType === 'ENTRY') return typeName === 'ENTRY'
    if (selectedType === 'ISSUE') return typeName === 'ISSUE'
    return true
  })

  const totalRevenue = filteredRecords.reduce(
    (sum, r) => sum + parseFloat(r.totalAmount || 0),
    0
  )

  return (
    <section className="section-container" aria-labelledby="reports-title">
      {/* Header */}
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
      </header>

      {/* Filtros */}
      <div className="filter-section">
        <div className="filter-group">
          <label>Desde</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Hasta</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Tipo de movimiento</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="form-select"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

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
            Total
          </h2>
          <strong style={{ fontSize: '1.75rem', color: '#27ae60' }}>
            ${totalRevenue.toFixed(2)}
          </strong>
        </article>
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
            Movimientos
          </h2>
          <strong style={{ fontSize: '1.75rem', color: '#3498db' }}>
            {filteredRecords.length}
          </strong>
        </article>
      </section>

      {/* Tabla de Movimientos */}
      <div className="table-wrapper">
        <table className="table-minimal">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Tipo</th>
              <th style={{ textAlign: 'center' }}>Cantidad</th>
              <th style={{ textAlign: 'right' }}>Precio Unit.</th>
              <th style={{ textAlign: 'right' }}>Total</th>
              <th>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => {
                const typeValue = getTypeValue(record)

                return (
                  <tr key={record._id}>
                    <td>{formatDate(record.date)}</td>
                    <td>
                      <strong>{record.productName?.productName}</strong>
                    </td>
                    <td>
                      <span
                        className={`badge-minimal ${isExit(typeValue) ? 'badge-danger' : 'badge-success'}`}
                      >
                        {formatTypeLabel(typeValue)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>{record.quantity}</td>
                    <td style={{ textAlign: 'right' }}>
                      ${parseFloat(record.productPrice).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong>
                        ${parseFloat(record.totalAmount).toFixed(2)}
                      </strong>
                    </td>
                    <td>
                      <small>{record.User?.username || 'N/A'}</small>
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
      </div>
    </section>
  )
}

export default ReportsSalesAndMovements
