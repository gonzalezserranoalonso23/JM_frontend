import { useState } from 'react'
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
  useGetCategories
} from '../../../features/categories.features'
import { Button, Alert } from 'react-bootstrap'
import { toast } from 'react-hot-toast'
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
    const sure = confirm('Esta seguro que desea borrar?')
    if (sure) return deleteCategory.mutate(id)
  }

  const handleUpdate = (data) => {
    handleShow()
    setCategory(data)
    setUpdate(true)
  }

  if (isLoading) return <Loading />
  if (isError) return toast.error('Hubo un error al cargar las categorías!')

  return (
    <>
      <section>
        <h5>
          Categorías
          <Button variant="warning mx-1 btn-sm my-1 " onClick={handleShow}>
            Crear Categoría
          </Button>
        </h5>
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
          <Alert variant="warning">No hay categorías para mostrar!</Alert>
        )}
      </section>
    </>
  )
}

export default SectionCategories
