import { useState } from 'react'
import {
  useGetProducts,
  useDeleteProduct,
  useCreateProduct,
  useUpdateProduct
} from '../../../features/products.features'
import { Button, Alert } from 'react-bootstrap'
import { toast } from 'react-hot-toast'
import ModalProducts from './ModalProducts'
import Loading from '../../../ui/Loading'
import TableProducts from './TableProducts'

const SectionProducts = () => {
  const { data: products, isLoading, isError } = useGetProducts()

  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const [modalShow, setModalShow] = useState(false)
  const [product, setProduct] = useState([])
  const [update, setUpdate] = useState(false)

  const handleClose = () => setModalShow(false)
  const handleShow = () => setModalShow(true)

  const handleDelete = (id) => {
    const sure = window.confirm('Esta seguro que desea borrar?')
    if (sure) return deleteProduct.mutate(id)
  }

  const handleUpdate = (data) => {
    handleShow()
    setProduct(data)
    setUpdate(true)
  }

  if (isLoading) return <Loading />
  if (isError) return toast.error('Hubo un error al cargar los productos!')

  return (
    <>
      <section>
        <h5>
          Productos
          <Button variant="warning mx-1 btn-sm my-1 " onClick={handleShow}>
            Crear Producto
          </Button>
        </h5>
        {!update ? (
          <ModalProducts
            modalShow={modalShow}
            handleClose={handleClose}
            action={createProduct}
            type="Crear"
            setUpdate={setUpdate}
          />
        ) : (
          <ModalProducts
            product={product}
            modalShow={modalShow}
            handleClose={handleClose}
            action={updateProduct}
            type="Editar"
            setUpdate={setUpdate}
          />
        )}

        {products?.length > 0 ? (
          <TableProducts
            products={products}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
          />
        ) : (
          <Alert variant="warning">No hay productos para mostrar!</Alert>
        )}
      </section>
    </>
  )
}

export default SectionProducts
