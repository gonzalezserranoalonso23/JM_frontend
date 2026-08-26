import { useState } from 'react'
import {
  useCreateSupplier,
  useDeleteSupplier,
  useUpdateSupplier,
  useGetSuppliers
} from '../../../features/suppliers.features'
import ModalSuppliers from './ModalSuppliers'
import Loading from '../../../ui/Loading'
import TableSuppliers from './TableSuppliers'

const SectionSuppliers = () => {
  const { data: suppliers, isLoading, isError } = useGetSuppliers()

  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()
  const deleteSupplier = useDeleteSupplier()

  const [modalShow, setModalShow] = useState(false)
  const [supplier, setSupplier] = useState([])
  const [update, setUpdate] = useState(false)

  const handleClose = () => setModalShow(false)
  const handleShow = () => setModalShow(true)

  const handleDelete = (id) => {
    const sure = window.confirm('Esta seguro que desea borrar?')
    if (sure) return deleteSupplier.mutate(id)
  }

  const handleUpdate = (data) => {
    handleShow()
    setSupplier(data)
    setUpdate(true)
  }

  if (isLoading) return <Loading />
  if (isError)
    return (
      <div
        className="alert-minimal alert-danger-minimal"
        style={{ margin: '2rem' }}
      >
        Error al cargar los proveedores
      </div>
    )

  return (
    <>
      <section>
        <div className="section-header">
          <h4 className="section-title">Proveedores</h4>
          <button
            className="btn-custom btn-warning-custom"
            onClick={handleShow}
          >
            + Crear Proveedor
          </button>
        </div>
        {!update ? (
          <ModalSuppliers
            modalShow={modalShow}
            handleClose={handleClose}
            action={createSupplier}
            type="Crear"
            setUpdate={setUpdate}
          />
        ) : (
          <ModalSuppliers
            supplier={supplier}
            modalShow={modalShow}
            handleClose={handleClose}
            action={updateSupplier}
            type="Editar"
            setUpdate={setUpdate}
          />
        )}

        {suppliers?.length > 0 ? (
          <TableSuppliers
            suppliers={suppliers}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
          />
        ) : (
          <div className="alert-minimal alert-warning-minimal">
            No hay proveedores para mostrar
          </div>
        )}
      </section>
    </>
  )
}

export default SectionSuppliers
