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
import ListSkeleton from '@/components/ListSkeleton'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
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

  return (
    <section aria-labelledby="daily-information-title">
      <Card className="p-4 sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <h1 id="daily-information-title" className="text-2xl font-semibold">
            Información diaria
          </h1>
          <Button type="button" onClick={handleCreate}>
            + Nuevo registro
          </Button>
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

        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <Alert variant="destructive">
            Error al cargar la información diaria
          </Alert>
        ) : filteredRecords.length ? (
          <TableDailyInformation
            records={filteredRecords}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
          />
        ) : (
          <Alert className="text-amber-400">
            No hay registros que coincidan
          </Alert>
        )}
      </Card>
    </section>
  )
}

export default SectionDailyInformation
