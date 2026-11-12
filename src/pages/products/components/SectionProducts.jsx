import { useState } from 'react'
import {
  useGetProductPages,
  useDeleteProduct,
  useCreateProduct,
  useUpdateProduct
} from '@/features/products.features'
import { getAllProducts } from '@/services/products.services'
import { notifyError } from '@/libs/handleErrors'
import { todayLocal } from '@/utils/dateDisplay'
import ModalProducts from './ModalProducts'
import useFilterQuery from '@/hooks/useFilterQuery'
import FormFilter from '@/components/molecules/FormFilter'
import { Card } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import TableProducts from './TableProducts'
import { hasFullAccess } from '@/auth/access'
import { useRoleName } from '@/features/users.features'

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

  const fullAccess = hasFullAccess(useRoleName())
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const [modalShow, setModalShow] = useState(false)
  const [product, setProduct] = useState([])
  const [update, setUpdate] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const { exportProductsToExcel } = await import('@/utils/exportExcel')
      const rows = await getAllProducts(dataFilter)
      await exportProductsToExcel(rows, `productos_${todayLocal()}.xlsx`)
    } catch (error) {
      notifyError(error, 'No se pudieron exportar los productos a Excel')
    } finally {
      setIsExporting(false)
    }
  }

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
    <Card
      as="section"
      className="gap-4 p-4 sm:p-6"
      aria-labelledby="products-title"
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 id="products-title" className="text-xl font-semibold">
          Productos
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            disabled={
              isLoading || isError || isExporting || totalProducts === 0
            }
          >
            {isExporting ? 'Exportando...' : 'Exportar a Excel'}
          </Button>
          {fullAccess && <Button onClick={handleShow}>+ Crear Producto</Button>}
        </div>
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
        canManage={fullAccess}
      />
    </Card>
  )
}

export default SectionProducts
