import { useState } from 'react'
import {
  useCreateDailyInformation,
  useDeleteDailyInformation,
  useGetDailyInformations,
  useUpdateDailyInformation
} from '@/features/dailyInformation.features'
import Loading from '@/ui/Loading'
import ModalDailyInformation from './ModalDailyInformation'
import TableDailyInformation from './TableDailyInformation'

const SectionDailyInformation = () => {
  const { data: records, isLoading, isError } = useGetDailyInformations()
  const createAction = useCreateDailyInformation()
  const updateAction = useUpdateDailyInformation()
  const deleteAction = useDeleteDailyInformation()
  const [modalShow, setModalShow] = useState(false)
  const [record, setRecord] = useState(null)

  const handleClose = () => {
    setModalShow(false)
    setRecord(null)
  }

  const handleCreate = () => {
    setRecord(null)
    setModalShow(true)
  }

  const handleUpdate = (selectedRecord) => {
    setRecord(selectedRecord)
    setModalShow(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Deseas eliminar este registro?')) {
      deleteAction.mutate(id)
    }
  }

  if (isLoading) return <Loading />
  if (isError) {
    return (
      <div className="alert-minimal alert-danger-minimal m-8">
        Error al cargar la información diaria
      </div>
    )
  }

  return (
    <section>
      <div className="section-header">
        <h1 className="section-title">Información diaria</h1>
        <button
          type="button"
          className="btn-custom btn-primary-custom"
          onClick={handleCreate}
        >
          + Nuevo registro
        </button>
      </div>

      <ModalDailyInformation
        record={record}
        modalShow={modalShow}
        handleClose={handleClose}
        action={record ? updateAction : createAction}
      />

      {records?.length ? (
        <TableDailyInformation
          records={records}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
        />
      ) : (
        <div className="alert-minimal alert-warning-minimal">
          No hay registros de información diaria
        </div>
      )}
    </section>
  )
}

export default SectionDailyInformation
