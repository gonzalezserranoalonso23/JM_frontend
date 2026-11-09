import PageShell from '@/components/PageShell'
import ActionIconButton from '@/components/ActionIconButton'
import DataList, { Column } from '@/components/DataList'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  useCreatePaymentType,
  useDeletePaymentType,
  useGetPaymentTypes,
  useUpdatePaymentType
} from '@/features/paymentTypes.features'
import { useCatalogEditor } from '@/hooks/useCatalogEditor'
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
          <DataList
            rows={paymentTypes}
            rowKey={(item) => item.value}
            total={paymentTypes.length}
          >
            <Column header="Método de pago" primary>
              {(item) => item.label}
            </Column>
            <Column header="Opciones" align="center" actions>
              {(item) => (
                <>
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
                </>
              )}
            </Column>
          </DataList>
        )}
      </Card>
    </PageShell>
  )
}

export default PaymentTypes
