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
      <div
        className="alert-minimal alert-danger-minimal"
        style={{ margin: '2rem' }}
      >
        Error al cargar las categorías
      </div>
    )

  return (
    <>
      <section className="section-container" aria-labelledby="categories-title">
        <header className="section-header">
          <h1 id="categories-title" className="section-title">
            Categorías
          </h1>
          <button
            className="btn-custom btn-primary-custom"
            onClick={handleShow}
          >
            + Crear Categoría
          </button>
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
          <div className="alert-minimal alert-warning-minimal">
            No hay categorías para mostrar
          </div>
        )}
      </section>
    </>
  )
}

export default SectionCategories
