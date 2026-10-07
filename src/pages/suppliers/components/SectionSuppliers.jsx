import { useState } from 'react'
import {
  useCreateSupplier,
  useDeleteSupplier,
  useUpdateSupplier,
  useGetSupplierPages
} from '@/features/suppliers.features'
import ModalSuppliers from './ModalSuppliers'
import Loading from '@/ui/Loading'
import TableSuppliers from './TableSuppliers'

const SectionSuppliers = () => {
  const {
    data: supplierPages,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetSupplierPages()
  const suppliers = supplierPages?.pages.flatMap((page) => page.data) || []
  const totalSuppliers = supplierPages?.pages[0]?.total || 0

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
      <section className="section-container" aria-labelledby="suppliers-title">
        <header className="section-header">
          <h1 id="suppliers-title" className="section-title">
            Proveedores
          </h1>
          <button
            className="btn-custom btn-primary-custom"
            onClick={handleShow}
          >
            + Crear Proveedor
          </button>
        </header>
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
            total={totalSuppliers}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
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
