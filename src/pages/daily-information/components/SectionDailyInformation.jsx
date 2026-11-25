import { useState } from 'react'
import {
  useCreateDailyInformation,
  useDeleteDailyInformation,
  useGetDailyInformationPages,
  useUpdateDailyInformation
} from '@/features/dailyInformation.features'
import ListSkeleton from '@/components/molecules/ListSkeleton'
import { Button } from '@/components/atoms/button'
import { Alert } from '@/components/atoms/alert'
import { Card } from '@/components/atoms/card'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { hasFullAccess } from '@/auth/access'
import { useIsAdmin } from '@/features/users.features'
import ModalDailyInformation from './ModalDailyInformation'
import TableDailyInformation from './TableDailyInformation'

const SectionDailyInformation = () => {
  const fullAccess = hasFullAccess(useIsAdmin())
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
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
      <Card as="section" className="p-4 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
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

        <div className="flex flex-wrap items-end gap-4">
          <div className="w-full sm:w-48">
            <Label className="mb-1" htmlFor="daily-information-from">
              Desde
            </Label>
            <Input
              id="daily-information-from"
              type="date"
              className="h-7 py-0"
              style={{ height: '28px', minHeight: '28px' }}
              value={from}
              aria-invalid={invalidRange}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Label className="mb-1" htmlFor="daily-information-to">
              Hasta
            </Label>
            <Input
              id="daily-information-to"
              type="date"
              className="h-7 py-0"
              style={{ height: '28px', minHeight: '28px' }}
              value={to}
              aria-invalid={invalidRange}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFrom('')
              setTo('')
            }}
            disabled={!hasFilters}
          >
            Borrar filtros
          </Button>
        </div>

        {invalidRange ? (
          <Alert variant="destructive">
            La fecha Desde no puede ser mayor que la fecha Hasta.
          </Alert>
        ) : isLoading ? (
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
