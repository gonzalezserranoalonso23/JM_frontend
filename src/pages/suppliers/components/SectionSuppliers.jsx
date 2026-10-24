import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import useFilterQuery from '@/hooks/useFilterQuery'
import FormFilter from '@/components/FormFilter'
import { useAuthStore } from '@/store/auth'

const SectionSuppliers = () => {
  const [dataFilter, setDataFilter] = useFilterQuery()
  const {
    data: supplierPages,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetSupplierPages(dataFilter)
  const suppliers = supplierPages?.pages.flatMap((page) => page.data) || []
  const totalSuppliers = supplierPages?.pages[0]?.total || 0

  const isAdmin = useAuthStore((state) => state.isAdmin)
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
      <Alert variant="destructive" className="m-8 w-auto">
        Error al cargar los proveedores
      </Alert>
    )

  return (
    <>
      <Card
        role="region"
        aria-labelledby="suppliers-title"
        className="gap-4 p-4 sm:p-6"
      >
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h1 id="suppliers-title" className="text-xl font-semibold">
            Proveedores
          </h1>
          {isAdmin && (
            <Button onClick={handleShow}>+ Crear Proveedor</Button>
          )}
        </header>
        <FormFilter
          id="supplier-filter"
          label="Buscar proveedor"
          value={dataFilter}
          onChange={setDataFilter}
        />
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
            canManage={isAdmin}
          />
        ) : (
          <Alert>No hay proveedores para mostrar</Alert>
        )}
      </Card>
    </>
  )
}

export default SectionSuppliers
