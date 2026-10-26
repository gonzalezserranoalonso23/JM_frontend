import PageShell from '@/components/PageShell'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  useCreatePaymentType,
  useDeletePaymentType,
  useGetPaymentTypes,
  useUpdatePaymentType
} from '@/features/paymentTypes.features'
import { useCatalogEditor } from '@/hooks/useCatalogEditor'
import ActionIconButton from '@/components/ActionIconButton'
import ListSkeleton from '@/components/ListSkeleton'
import ModalPaymentTypes from './components/ModalPaymentTypes'

const PaymentTypes = () => {
  const { data: paymentTypes, isLoading, isError } = useGetPaymentTypes()
  const createPaymentType = useCreatePaymentType()
  const updatePaymentType = useUpdatePaymentType()
  const deletePaymentType = useDeletePaymentType()
  const {
    modalShow,
    item: selected,
    openCreate,
    openEdit: handleUpdate,
    close: handleClose,
    remove
  } = useCatalogEditor()

  const handleDelete = (id) => remove(deletePaymentType.mutate, id)

  return (
    <PageShell>
      <Card
        as="section"
        aria-labelledby="payment-types-title"
        className="gap-4 p-4 sm:p-6"
      >
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h1 id="payment-types-title" className="text-xl font-semibold">
            Métodos de pago
          </h1>
          <Button onClick={openCreate}>+ Crear método de pago</Button>
        </header>

        <ModalPaymentTypes
          key={selected?.value ?? 'new'}
          paymentType={selected}
          modalShow={modalShow}
          handleClose={handleClose}
          action={selected ? updatePaymentType : createPaymentType}
          type={selected ? 'Editar' : 'Crear'}
        />

        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <Alert variant="destructive">
            Error al cargar los métodos de pago
          </Alert>
        ) : paymentTypes.length === 0 ? (
          <Alert>No hay métodos de pago para mostrar</Alert>
        ) : (
          <div>
            <div className="space-y-3 xl:hidden">
              {paymentTypes.map((item) => (
                <Card as="article" key={item.value} className="gap-3 py-4">
                  <CardContent className="space-y-3 px-4">
                    <h2 className="break-words font-medium">{item.label}</h2>

                    <div className="flex items-center justify-end gap-2 border-t pt-3">
                      <ActionIconButton
                        action="edit"
                        label="Editar"
                        onClick={() => handleUpdate(item)}
                      />
                      <ActionIconButton
                        action="delete"
                        label="Eliminar"
                        onClick={() => handleDelete(item.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="hidden rounded-lg border xl:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Método de pago</TableHead>
                    <TableHead className="text-center">Opciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentTypes.map((item) => (
                    <TableRow key={item.value}>
                      <TableCell>{item.label}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                          <ActionIconButton
                            action="edit"
                            label="Editar"
                            onClick={() => handleUpdate(item)}
                          />
                          <ActionIconButton
                            action="delete"
                            label="Eliminar"
                            onClick={() => handleDelete(item.value)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <caption className="mt-2 pb-2 text-sm text-muted-foreground">
                  Total: {paymentTypes.length}
                </caption>
              </Table>
            </div>
          </div>
        )}
      </Card>
    </PageShell>
  )
}

export default PaymentTypes
