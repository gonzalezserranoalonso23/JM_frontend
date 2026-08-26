import { useState } from 'react'
import {
  useGetProducts,
  useDeleteProduct,
  useCreateProduct,
  useUpdateProduct
} from '../../../features/products.features'
import ModalProducts from './ModalProducts'
import FormFilter from './FormFilter'
import Loading from '../../../ui/Loading'
import TableProducts from './TableProducts'

const SectionProducts = () => {
  const { data: products, isLoading, isError } = useGetProducts()

  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const [dataFilter, setDataFilter] = useState('')

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

  const filter = products?.filter((product) => {
    if (dataFilter)
      return product?.productName
        ?.toLowerCase()
        .includes(dataFilter.toLowerCase())
    else return product
  })

  if (isLoading) return <Loading />
  if (isError)
    return (
      <div
        className="alert-minimal alert-danger-minimal"
        style={{ margin: '2rem' }}
      >
        Error al cargar los productos
      </div>
    )

  return (
    <>
      <section>
        <div className="section-header">
          <h4 className="section-title">Productos</h4>
          <button
            className="btn-custom btn-warning-custom"
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

        {filter?.length > 0 ? (
          <TableProducts
            products={filter}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
          />
        ) : (
          <div className="alert-minimal alert-warning-minimal">
            No hay productos para mostrar
          </div>
        )}
      </section>
    </>
  )
}

export default SectionProducts
