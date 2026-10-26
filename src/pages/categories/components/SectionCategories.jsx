import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
  useGetCategoryPages
} from '@/features/categories.features'
import { useCatalogEditor } from '@/hooks/useCatalogEditor'
import ModalCategories from './ModalCategories'
import ListSkeleton from '@/components/ListSkeleton'
import TableCategories from './TableCategories'

const SectionCategories = () => {
  const {
    data: categoryPages,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetCategoryPages()
  const categories = categoryPages?.pages.flatMap((page) => page.data) || []
  const totalCategories = categoryPages?.pages[0]?.total || 0

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const {
    modalShow,
    item: category,
    editing: update,
    setEditing: setUpdate,
    openCreate: handleShow,
    openEdit: handleUpdate,
    close: handleClose,
    remove
  } = useCatalogEditor()

  const handleDelete = (id) => remove(deleteCategory.mutate, id)

  return (
    <>
      <Card
        as="section"
        aria-labelledby="categories-title"
        className="gap-4 p-4 sm:p-6"
      >
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h1 id="categories-title" className="text-xl font-semibold">
            Categorías
          </h1>
          <Button onClick={handleShow}>+ Crear Categoría</Button>
        </header>
        {!update ? (
          <ModalCategories
            modalShow={modalShow}
            handleClose={handleClose}
            action={createCategory}
            type="Crear"
            setUpdate={setUpdate}
          />
        ) : (
          <ModalCategories
            category={category}
            modalShow={modalShow}
            handleClose={handleClose}
            action={updateCategory}
            type="Editar"
            setUpdate={setUpdate}
          />
        )}

        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <Alert variant="destructive">Error al cargar las categorías</Alert>
        ) : categories?.length > 0 ? (
          <TableCategories
            categories={categories}
            total={totalCategories}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
          />
        ) : (
          <Alert>No hay categorías para mostrar</Alert>
        )}
      </Card>
    </>
  )
}

export default SectionCategories
