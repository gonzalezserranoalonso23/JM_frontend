import { formatMoney } from '@/utils/commonFunctions'
import { formatDate } from '@/utils/dateDisplay'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  useGetInventoryRecordPages,
  useDeleteInventoryRecord,
  useCreateInventoryRecord,
  useCreateInventoryRecords,
  useUpdateInventoryRecord
} from '@/features/inventory.features'
import ModalIssues from './ModalIssues'
import ListSkeleton from '@/components/ListSkeleton'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'
import RecordCards from '@/components/RecordCards'
import ActionIconButton from '@/components/ActionIconButton'
import InfiniteScrollFooter from '@/components/InfiniteScrollFooter'
import useDebouncedValue from '@/hooks/useDebouncedValue'
import useFilterQuery from '@/hooks/useFilterQuery'
import FormFilter from '@/components/FormFilter'
import { useGetPaymentTypes } from '@/features/paymentTypes.features'

const ALL_PAYMENTS = 'all'

const SectionIssues = () => {
  const navigate = useNavigate()
  const { data: paymentTypes } = useGetPaymentTypes()
  const createRecord = useCreateInventoryRecord()
  const createRecords = useCreateInventoryRecords()
  const updateRecord = useUpdateInventoryRecord()
  const deleteRecord = useDeleteInventoryRecord()

  const [dataFilter, setDataFilter] = useFilterQuery()
  const [paymentFilter, setPaymentFilter] = useState('')
  const search = useDebouncedValue(dataFilter.trim())
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useGetInventoryRecordPages({
    direction: -1,
    search,
    paymentType: paymentFilter
  })
  const records = data?.pages.flatMap((page) => page.data) ?? []
  const total = data?.pages[0]?.total ?? 0
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
        '¿Eliminar este registro?\n\nAl eliminarlo se regresará al inventario la cantidad que había descontado esta salida.'
      )
    ) {
      deleteRecord.mutate(id)
    }
  }

  return (
    <section aria-labelledby="issues-title">
      <Card className="p-4 sm:p-6">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 id="issues-title" className="text-2xl font-semibold">
              Salidas
            </h1>
            <p className="text-sm text-muted-foreground">
              Registros de ventas y movimientos negativos
            </p>
          </div>
          <Button onClick={handleShow}>↑ Nueva Salida</Button>
        </header>

        {/* Filtro */}
        <FormFilter
          id="issue-filter"
          label="Buscar salidas"
          placeholder="Producto o fecha (20/10/2026)"
          value={dataFilter}
          onChange={setDataFilter}
        >
          <div className="flex min-w-[200px] flex-col gap-2">
            <Label htmlFor="issue-payment-filter" className="mb-0">
              Forma de pago
            </Label>
            <Select
              value={paymentFilter || ALL_PAYMENTS}
              onValueChange={(value) =>
                setPaymentFilter(value === ALL_PAYMENTS ? '' : value)
              }
            >
              <SelectTrigger id="issue-payment-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PAYMENTS}>Todas</SelectItem>
                {paymentTypes.map((payment) => (
                  <SelectItem key={payment.value} value={payment.value}>
                    {payment.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FormFilter>

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
        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <Alert variant="destructive">Error al cargar las salidas</Alert>
        ) : records.length > 0 ? (
          <>
            <RecordCards
              records={records}
              showPayment
              detailsPath="/issues"
              onEdit={handleShowEdit}
              onDelete={handleDelete}
            />
            <div className="hidden rounded-lg border xl:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Tipo de pago</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>
                        <Link
                          to={`/issues/${record._id}`}
                          className="font-semibold underline-offset-2 hover:underline"
                        >
                          {record.productName?.productName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {record.typeInventory?.typeInventory}
                      </TableCell>
                      <TableCell className="text-center">
                        {record.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMoney(record.productPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        <strong>{formatMoney(record.totalAmount)}</strong>
                      </TableCell>
                      <TableCell>
                        <small className="text-muted-foreground">
                          {record.paymentType?.paymentType || '-'}
                        </small>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
                          <ActionIconButton
                            action="open"
                            label="Ver detalle"
                            onClick={() => navigate(`/issues/${record._id}`)}
                          />
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
          </>
        ) : (
          <Alert>No hay salidas registradas</Alert>
        )}
        <footer>
          <InfiniteScrollFooter
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
          {total > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Mostrando {records.length} de {total} salidas
            </p>
          )}
        </footer>
      </Card>
    </section>
  )
}

export default SectionIssues
