import { formatDate } from '@/utils/dateDisplay'
import { useState } from 'react'
import {
  useGetInventoryRecordPages,
  useDeleteInventoryRecord,
  useCreateInventoryRecord,
  useCreateInventoryRecords,
  useUpdateInventoryRecord
} from '@/features/inventory.features'
import ModalEntries from './ModalEntries'
import Loading from '@/ui/Loading'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'
import ActionIconButton from '@/components/ActionIconButton'
import useIntersectionPagination from '@/hooks/useIntersectionPagination'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import useFilterQuery from '@/hooks/useFilterQuery'
import FormFilter from '@/components/FormFilter'

const SectionEntries = () => {
  const createRecord = useCreateInventoryRecord()
  const createRecords = useCreateInventoryRecords()
  const updateRecord = useUpdateInventoryRecord()
  const deleteRecord = useDeleteInventoryRecord()

  const [dataFilter, setDataFilter] = useFilterQuery()
  const search = useDebouncedValue(dataFilter.trim())
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useGetInventoryRecordPages({
    direction: 1,
    search
  })
  const records = data?.pages.flatMap((page) => page.data) ?? []
  const total = data?.pages[0]?.total ?? 0
  const { sentinelRef, supportsIntersectionObserver } =
    useIntersectionPagination(
      fetchNextPage,
      Boolean(hasNextPage) && !isFetchingNextPage
    )
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
    if (
      window.confirm(
        '¿Eliminar este registro?\n\nAl eliminarlo se descontará del inventario la cantidad que había sumado esta entrada.'
      )
    ) {
      deleteRecord.mutate(id)
    }
  }

  if (isLoading) return <Loading />
  if (isError)
    return (
      <Alert variant="destructive" className="m-8">
        Error al cargar las entradas
      </Alert>
    )

  return (
    <section aria-labelledby="entries-title">
      <Card className="p-4 sm:p-6">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 id="entries-title" className="text-2xl font-semibold">
              Entradas
            </h1>
            <p className="text-sm text-muted-foreground">
              Registros de compras y movimientos positivos
            </p>
          </div>
          <Button onClick={handleShow}>↓ Nueva Entrada</Button>
        </header>

        {/* Filtro */}
        <FormFilter
          id="entry-filter"
          label="Buscar entradas"
          value={dataFilter}
          onChange={setDataFilter}
        />

        {/* Modal */}
        <ModalEntries
          modalShow={modalShow}
          handleClose={handleClose}
          action={isEditing ? updateRecord : createRecord}
          createBulkAction={createRecords}
          record={selectedRecord}
          isEditing={isEditing}
        />

        {/* Tabla */}
        {records.length > 0 ? (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>
                      <strong>{record.productName?.productName}</strong>
                    </TableCell>
                    <TableCell>{record.typeInventory?.typeInventory}</TableCell>
                    <TableCell className="text-center">
                      {record.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      ${parseFloat(record.productPrice).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <strong>
                        ${parseFloat(record.totalAmount).toFixed(2)}
                      </strong>
                    </TableCell>
                    <TableCell className="text-center">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Alert>No hay entradas registradas</Alert>
        )}
        {hasNextPage &&
          (supportsIntersectionObserver ? (
            <div ref={sentinelRef} className="h-1" aria-hidden="true" />
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              Cargar más
            </Button>
          ))}
        {total > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Mostrando {records.length} de {total} entradas
          </p>
        )}
      </Card>
    </section>
  )
}

export default SectionEntries
