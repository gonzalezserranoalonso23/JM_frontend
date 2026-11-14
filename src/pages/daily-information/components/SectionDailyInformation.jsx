import { useState } from 'react'
import {
  useCreateDailyInformation,
  useDeleteDailyInformation,
  useGetDailyInformationPages,
  useUpdateDailyInformation
} from '@/features/dailyInformation.features'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import useFilterQuery from '@/hooks/useFilterQuery'
import FormFilter from '@/components/molecules/FormFilter'
import ListSkeleton from '@/components/molecules/ListSkeleton'
import { Button } from '@/components/atoms/button'
import { Alert } from '@/components/atoms/alert'
import { Card } from '@/components/atoms/card'
import { hasFullAccess } from '@/auth/access'
import { useRoleName } from '@/features/users.features'
import ModalDailyInformation from './ModalDailyInformation'
import TableDailyInformation from './TableDailyInformation'

const SectionDailyInformation = () => {
  const fullAccess = hasFullAccess(useRoleName())
  const [textFilter, setTextFilter] = useFilterQuery()
  const search = useDebouncedValue(textFilter.trim())
  const {
    data: recordPages,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetDailyInformationPages(search)
  const records = recordPages?.pages.flatMap((page) => page.data) || []
  const total = recordPages?.pages[0]?.total || 0
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

  return (
    <section aria-labelledby="daily-information-title">
      <Card className="p-4 sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <h1 id="daily-information-title" className="text-2xl font-semibold">
            Información diaria
          </h1>
          {fullAccess && (
            <Button type="button" onClick={handleCreate}>
              + Nuevo registro
            </Button>
          )}
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
        ) : records.length ? (
          <TableDailyInformation
            records={records}
            total={total}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
            canManage={fullAccess}
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
