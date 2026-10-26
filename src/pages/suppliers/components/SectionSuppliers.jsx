import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  useCreateSupplier,
  useDeleteSupplier,
  useUpdateSupplier,
  useGetSupplierPages
} from '@/features/suppliers.features'
import { useCatalogEditor } from '@/hooks/useCatalogEditor'
import ModalSuppliers from './ModalSuppliers'
import ListSkeleton from '@/components/ListSkeleton'
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
  const {
    modalShow,
    item: supplier,
    editing: update,
    setEditing: setUpdate,
    openCreate: handleShow,
    openEdit: handleUpdate,
    close: handleClose,
    remove
  } = useCatalogEditor()

  const handleDelete = (id) => remove(deleteSupplier.mutate, id)

  return (
    <>
      <Card
        as="section"
        aria-labelledby="suppliers-title"
        className="gap-4 p-4 sm:p-6"
      >
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h1 id="suppliers-title" className="text-xl font-semibold">
            Proveedores
          </h1>
          {isAdmin && <Button onClick={handleShow}>+ Crear Proveedor</Button>}
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

        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <Alert variant="destructive">Error al cargar los proveedores</Alert>
        ) : suppliers?.length > 0 ? (
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
