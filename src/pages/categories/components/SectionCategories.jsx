import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useState } from 'react'
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
  useGetCategoryPages
} from '@/features/categories.features'
import ModalCategories from './ModalCategories'
import Loading from '@/ui/Loading'
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

  const [modalShow, setModalShow] = useState(false)
  const [category, setCategory] = useState([])
  const [update, setUpdate] = useState(false)

  const handleClose = () => setModalShow(false)
  const handleShow = () => setModalShow(true)

  const handleDelete = (id) => {
    const sure = window.confirm('Esta seguro que desea borrar?')
    if (sure) return deleteCategory.mutate(id)
  }

  const handleUpdate = (data) => {
    handleShow()
    setCategory(data)
    setUpdate(true)
  }

  if (isLoading) return <Loading />
  if (isError)
    return (
      <Alert variant="destructive" className="m-8 w-auto">
        Error al cargar las categorías
      </Alert>
    )

  return (
    <>
      <Card
        role="region"
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

        {categories?.length > 0 ? (
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
