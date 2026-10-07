import { useState } from 'react'
import {
  useGetProductPages,
  useDeleteProduct,
  useCreateProduct,
  useUpdateProduct
} from '@/features/products.features'
import ModalProducts from './ModalProducts'
import useFilterQuery from '@/hooks/useFilterQuery'
import FormFilter from '@/components/FormFilter'
import TableProducts from './TableProducts'

const SectionProducts = () => {
  const [dataFilter, setDataFilter] = useFilterQuery()
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

  const handleToggleActive = (product) =>
    updateProduct.mutate({
      id: product?._id,
      body: { isActive: !(product?.isActive ?? true) }
    })

  return (
    <section className="section-container" aria-labelledby="products-title">
      <header className="section-header">
        <h1 id="products-title" className="section-title">
          Productos
        </h1>
        <button className="btn-custom btn-primary-custom" onClick={handleShow}>
          + Crear Producto
        </button>
      </header>
      <FormFilter
        id="product-filter"
        label="Buscar producto"
        value={dataFilter}
        onChange={setDataFilter}
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
        handleToggleActive={handleToggleActive}
      />
    </section>
  )
}

export default SectionProducts
