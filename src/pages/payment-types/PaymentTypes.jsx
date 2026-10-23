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
import { useState } from 'react'
import {
  useCreatePaymentType,
  useDeletePaymentType,
  useGetPaymentTypes,
  useUpdatePaymentType
} from '@/features/paymentTypes.features'
import ActionIconButton from '@/components/ActionIconButton'
import Loading from '@/ui/Loading'
import ModalPaymentTypes from './components/ModalPaymentTypes'

const PaymentTypes = () => {
  const { data: paymentTypes, isLoading, isError } = useGetPaymentTypes()
  const createPaymentType = useCreatePaymentType()
  const updatePaymentType = useUpdatePaymentType()
  const deletePaymentType = useDeletePaymentType()

  const [modalShow, setModalShow] = useState(false)
  const [selected, setSelected] = useState(null)

  const handleClose = () => {
    setModalShow(false)
    setSelected(null)
  }

  const handleUpdate = (item) => {
    setSelected(item)
    setModalShow(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Esta seguro que desea borrar?')) {
      deletePaymentType.mutate(id)
    }
  }

  if (isLoading) return <Loading />

  return (
    <PageShell>
      <Card
        role="region"
        aria-labelledby="payment-types-title"
        className="gap-4 p-4 sm:p-6"
      >
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h1 id="payment-types-title" className="text-xl font-semibold">
            Métodos de pago
          </h1>
          <Button onClick={() => setModalShow(true)}>
            + Crear método de pago
          </Button>
        </header>

        <ModalPaymentTypes
          key={selected?.value ?? 'new'}
          paymentType={selected}
          modalShow={modalShow}
          handleClose={handleClose}
          action={selected ? updatePaymentType : createPaymentType}
          type={selected ? 'Editar' : 'Crear'}
        />

        {isError ? (
          <Alert variant="destructive">
            Error al cargar los métodos de pago
          </Alert>
        ) : paymentTypes.length === 0 ? (
          <Alert>No hay métodos de pago para mostrar</Alert>
        ) : (
          <div>
            <div className="space-y-3 lg:hidden">
              {paymentTypes.map((item) => (
                <Card key={item.value} className="gap-3 py-4">
                  <CardContent className="space-y-3 px-4">
                    <p className="break-words font-medium">{item.label}</p>

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
            <div className="hidden rounded-lg border lg:block">
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
