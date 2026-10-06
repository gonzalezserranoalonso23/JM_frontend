import { useState } from 'react'
import {
  useGetProductPages,
  useDeleteProduct,
  useCreateProduct,
  useUpdateProduct
} from '@/features/products.features'
import ModalProducts from './ModalProducts'
import FormFilter from './FormFilter'
import TableProducts from './TableProducts'

const SectionProducts = () => {
  const [dataFilter, setDataFilter] = useState('')
  const {
    data: productPages,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetProductPages(dataFilter)
  const products = productPages?.pages.flatMap((page) => page.data) || []
  const totalProducts = productPages?.pages[0]?.total || 0

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

  return (
    <>
      <section>
        <div className="section-header">
          <h4 className="section-title">Productos</h4>
          <button
            className="btn-custom btn-primary-custom"
            onClick={handleShow}
          >
            + Crear Producto
          </button>
        </div>
        <FormFilter
          name="producto"
          dataFilter={dataFilter}
          setDataFilter={setDataFilter}
        />
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

        <TableProducts
          products={products}
          total={totalProducts}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          isError={isError}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
        />
      </section>
    </>
  )
}

export default SectionProducts
