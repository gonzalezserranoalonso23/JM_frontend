import { useState } from 'react'
import { useGetLowStockProductPages } from '@/features/inventory.features'
import { useGetCategories } from '@/features/categories.features'
import FormFilter from '@/components/FormFilter'
import useFilterQuery from '@/hooks/useFilterQuery'
import useIntersectionPagination from '@/hooks/useIntersectionPagination'
import Loading from '@/ui/Loading'
import '../../styles/inventory.css'

const Shortages = () => {
  const [dataFilter, setDataFilter] = useFilterQuery('q')
  const [category, setCategory] = useState('')
  const { data: categories } = useGetCategories()
  const {
    data: pages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetLowStockProductPages(dataFilter.trim(), category)
  const { sentinelRef, supportsIntersectionObserver } =
    useIntersectionPagination(
      fetchNextPage,
      Boolean(hasNextPage) && !isFetchingNextPage
    )

  if (isLoading) return <Loading />

  const products = pages?.pages.flatMap((page) => page.data) || []
  const total = pages?.pages[0]?.total ?? 0

  return (
    <div className="bg-light py-6">
      <div className="page-content-shell mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section
          className="section-container"
          aria-labelledby="shortages-title"
        >
          <header className="section-header">
            <div>
              <h1
                id="shortages-title"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#111827',
                  margin: 0
                }}
              >
                Faltantes
              </h1>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: '0.25rem 0 0 0'
                }}
              >
                Productos con stock bajo
              </p>
            </div>
          </header>

          <div className="flex flex-wrap items-end gap-4">
            <FormFilter
              id="shortages-filter"
              label="Buscar producto"
              placeholder="Buscar en faltantes..."
              value={dataFilter}
              onChange={setDataFilter}
            />
            <div className="filter-section">
              <div className="filter-group">
                <label htmlFor="shortages-category">Categoría</label>
                <select
                  id="shortages-category"
                  className="form-select"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="">Todas</option>
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.categories}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="table-minimal">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th style={{ textAlign: 'center' }}>Stock</th>
                  <th style={{ textAlign: 'center' }}>Mínimo</th>
                  <th style={{ textAlign: 'center' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <strong>{product.productName}</strong>
                        {product.productDescription && (
                          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                            {product.productDescription}
                          </div>
                        )}
                      </td>
                      <td>{product.category?.categories || 'N/A'}</td>
                      <td style={{ textAlign: 'center' }}>
                        {product.productStock}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {product.minimumProductStock}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`badge-minimal ${product.productStock === 0 ? 'badge-danger' : 'badge-warning'}`}
                        >
                          {product.productStock === 0 ? 'Agotado' : 'Bajo'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: '#7f8c8d'
                      }}
                    >
                      No hay productos faltantes
                    </td>
                  </tr>
                )}
              </tbody>
              <caption className="text-sm text-gray-500 mt-2">
                Total: {total}
              </caption>
            </table>
            {hasNextPage && supportsIntersectionObserver && (
              <div ref={sentinelRef} className="h-1" aria-hidden="true" />
            )}
            {isFetchingNextPage && supportsIntersectionObserver && (
              <Loading fullScreen={false} />
            )}
            {hasNextPage && !supportsIntersectionObserver && (
              <button
                type="button"
                className="w-full py-3 text-sm font-medium"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <Loading fullScreen={false} />
                ) : (
                  'Cargar más'
                )}
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Shortages
