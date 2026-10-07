import { useState } from 'react'
import {
  useCreateDailyInformation,
  useDeleteDailyInformation,
  useGetDailyInformations,
  useUpdateDailyInformation
} from '@/features/dailyInformation.features'
import useFilterQuery from '@/hooks/useFilterQuery'
import FormFilter from '@/components/FormFilter'
import { buildMatcher, dateCells, matchesCells } from '@/utils/filterMatcher'
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
  const [textFilter, setTextFilter] = useFilterQuery()

  const matcher = buildMatcher(textFilter)

  const filteredRecords = (records || [])
    .filter((item) => {
      if (!matchesCells(dateCells(item.date), matcher)) return false
      return true
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))

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
    <section
      className="section-container"
      aria-labelledby="daily-information-title"
    >
      <header className="section-header">
        <h1 id="daily-information-title" className="section-title">
          Información diaria
        </h1>
        <button
          type="button"
          className="btn-custom btn-primary-custom"
          onClick={handleCreate}
        >
          + Nuevo registro
        </button>
      </header>

      <ModalDailyInformation
        record={record}
        modalShow={modalShow}
        handleClose={handleClose}
        action={record ? updateAction : createAction}
      />

      <FormFilter
        id="daily-filter"
        label="Buscar información diaria"
        value={textFilter}
        onChange={setTextFilter}
      />

      {filteredRecords.length ? (
        <TableDailyInformation
          records={filteredRecords}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
        />
      ) : (
        <div className="alert-minimal alert-warning-minimal">
          No hay registros que coincidan
        </div>
      )}
    </section>
  )
}

export default SectionDailyInformation
