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
    <div className="bg-light py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 page-content-shell">
        <section
          className="section-container"
          aria-labelledby="payment-types-title"
        >
          <header className="section-header">
            <h1 id="payment-types-title" className="section-title">
              Métodos de pago
            </h1>
            <button
              className="btn-custom btn-primary-custom"
              onClick={() => setModalShow(true)}
            >
              + Crear método de pago
            </button>
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
            <div className="alert-minimal alert-danger-minimal">
              Error al cargar los métodos de pago
            </div>
          ) : paymentTypes.length === 0 ? (
            <div className="alert-minimal alert-warning-minimal">
              No hay métodos de pago para mostrar
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table-minimal">
                <thead>
                  <tr>
                    <th>Método de pago</th>
                    <th className="text-center">Opciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentTypes.map((item) => (
                    <tr key={item.value}>
                      <td>{item.label}</td>
                      <td className="text-center">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
                <caption className="text-sm text-gray-500 mt-2">
                  Total: {paymentTypes.length}
                </caption>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default PaymentTypes
