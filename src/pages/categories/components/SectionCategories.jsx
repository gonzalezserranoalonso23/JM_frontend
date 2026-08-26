import { useState } from 'react'
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
  useGetCategories
} from '../../../features/categories.features'
import ModalCategories from './ModalCategories'
import Loading from '../../../ui/Loading'
import TableCategories from './TableCategories'

const SectionCategories = () => {
  const { data: categories, isLoading, isError } = useGetCategories()

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
      <section>
        <div className="section-header">
          <h4 className="section-title">Categorías</h4>
          <button
            className="btn-custom btn-warning-custom"
            onClick={handleShow}
          >
            + Crear Categoría
          </button>
        </div>
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
