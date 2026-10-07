import { formatDate } from '@/utils/dateDisplay'
import { useState } from 'react'
import {
  useGetInventoryRecords,
  useDeleteInventoryRecord,
  useCreateInventoryRecord,
  useCreateInventoryRecords,
  useUpdateInventoryRecord
} from '@/features/inventory.features'
import ModalIssues from './ModalIssues'
import Loading from '@/ui/Loading'
import '../../../styles/inventory.css'
import ActionIconButton from '@/components/ActionIconButton'
import useFilterQuery from '@/hooks/useFilterQuery'
import FormFilter from '@/components/FormFilter'
import { buildMatcher, dateCells, matchesCells } from '@/utils/filterMatcher'

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
  const createRecords = useCreateInventoryRecords()
  const updateRecord = useUpdateInventoryRecord()
  const deleteRecord = useDeleteInventoryRecord()

  const [dataFilter, setDataFilter] = useFilterQuery()
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

  const matcher = buildMatcher(dataFilter)

  const filteredRecords = records?.filter((record) => {
    const isExit = getTypeValue(record) === 'ISSUE'

    if (!isExit) return false

    return matchesCells(
      [record.productName?.productName, ...dateCells(record.date)],
      matcher
    )
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
    <section className="section-container" aria-labelledby="issues-title">
      {/* Header */}
      <header className="section-header">
        <div>
          <h1 id="issues-title" className="section-title">
            Salidas
          </h1>
          <p className="section-subtitle">
            Registros de ventas y movimientos negativos
          </p>
        </div>
        <button className="btn-custom btn-danger-custom" onClick={handleShow}>
          ↑ Nueva Salida
        </button>
      </header>

      {/* Filtro */}
      <FormFilter
        id="issue-filter"
        label="Buscar salidas"
        value={dataFilter}
        onChange={setDataFilter}
      />

      {/* Modal */}
      <ModalIssues
        modalShow={modalShow}
        handleClose={handleClose}
        action={isEditing ? updateRecord : createRecord}
        createBulkAction={createRecords}
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
                  <td>{formatDate(record.date)}</td>
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
                      <ActionIconButton
                        action="edit"
                        label="Editar"
                        onClick={() => handleShowEdit(record)}
                      />
                      <ActionIconButton
                        action="delete"
                        label="Eliminar"
                        onClick={() => handleDelete(record._id)}
                      />
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
    </section>
  )
}

export default SectionIssues
