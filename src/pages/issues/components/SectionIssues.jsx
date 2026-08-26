import { useState } from 'react'
import {
  useGetInventoryRecords,
  useDeleteInventoryRecord,
  useCreateInventoryRecord,
  useUpdateInventoryRecord
} from '../../../features/inventory.features'
import ModalIssues from './ModalIssues'
import Loading from '../../../ui/Loading'
import '../../../styles/inventory.css'

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

const SectionIssues = () => {
  const { data: records, isLoading, isError } = useGetInventoryRecords()
  const createRecord = useCreateInventoryRecord()
  const updateRecord = useUpdateInventoryRecord()
  const deleteRecord = useDeleteInventoryRecord()

  const [dataFilter, setDataFilter] = useState('')
  const [modalShow, setModalShow] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleClose = () => {
    setModalShow(false)
    setSelectedRecord(null)
    setIsEditing(false)
  }

  const handleShow = () => {
    setSelectedRecord(null)
    setIsEditing(false)
    setModalShow(true)
  }

  const handleShowEdit = (record) => {
    setSelectedRecord(record)
    setIsEditing(true)
    setModalShow(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este registro?')) {
      deleteRecord.mutate(id)
    }
  }

  const filteredRecords = records?.filter((record) => {
    const isExit = getTypeValue(record) === 'ISSUE'

    if (!isExit) return false

    if (dataFilter) {
      return record.productName.productName
        .toLowerCase()
        .includes(dataFilter.toLowerCase())
    }
    return true
  })

  if (isLoading) return <Loading />
  if (isError)
    return (
      <div
        className="alert-minimal alert-danger-minimal"
        style={{ margin: '2rem' }}
      >
        Error al cargar las salidas
      </div>
    )

  return (
    <div className="section-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h4 className="section-title">Salidas</h4>
          <p className="section-subtitle">
            Registros de ventas y movimientos negativos
          </p>
        </div>
        <button className="btn-custom btn-danger-custom" onClick={handleShow}>
          ↑ Nueva Salida
        </button>
      </div>

      {/* Filtro */}
      <div className="filter-section">
        <div className="filter-group">
          <label>Buscar por producto</label>
          <input
            type="text"
            placeholder="Nombre del producto..."
            value={dataFilter}
            onChange={(e) => setDataFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Modal */}
      <ModalIssues
        modalShow={modalShow}
        handleClose={handleClose}
        action={isEditing ? updateRecord : createRecord}
        record={selectedRecord}
        isEditing={isEditing}
      />

      {/* Tabla */}
      {filteredRecords && filteredRecords.length > 0 ? (
        <div className="table-wrapper">
          <table className="table-minimal">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th style={{ textAlign: 'center' }}>Cantidad</th>
                <th style={{ textAlign: 'right' }}>Precio</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th>Notas</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record._id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>
                    <strong>{record.productName?.productName}</strong>
                  </td>
                  <td>{getTypeValue(record)}</td>
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
                    <small className="text-muted">
                      {record.Observations || '-'}
                    </small>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                      <button
                        className="btn-action btn-info-sm w-full sm:w-auto"
                        onClick={() => handleShowEdit(record)}
                        title="Editar"
                      >
                        Editar
                      </button>
                      <button
                        className="btn-action btn-danger-sm w-full sm:w-auto"
                        onClick={() => handleDelete(record._id)}
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert-minimal alert-info-minimal">
          No hay salidas registradas
        </div>
      )}
    </div>
  )
}

export default SectionIssues
