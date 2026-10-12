import { useState } from 'react'
import { useSearchProducts } from '@/features/products.features'

const formatPrice = (value) =>
  Number(value || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN'
  })

const ProductLookup = () => {
  const [search, setSearch] = useState('')
  const term = search.trim()
  const { data, isFetching } = useSearchProducts(term)
  const products = term ? data?.data || [] : []

  return (
    <section
      className="dashboard-card home-dashboard-card rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] overflow-hidden mb-8 border border-slate-200"
      aria-labelledby="product-lookup-title"
    >
      <header className="low-stock-header px-6 py-4">
        <h2 id="product-lookup-title" className="font-semibold">
          🔎 Consultar precio y stock
        </h2>
      </header>
      <div className="px-6 py-5 border-b border-slate-200">
        <label
          htmlFor="product-lookup"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Buscar producto
        </label>
        <input
          id="product-lookup"
          type="search"
          className="w-full rounded-lg border-2 border-amber-400 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-amber-200"
          placeholder="Escribe el nombre del producto..."
          autoComplete="off"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      {term && products.length === 0 && (
        <p className="px-6 py-4 text-sm text-slate-500">
          {isFetching ? 'Buscando...' : 'Sin resultados'}
        </p>
      )}
      {products.length > 0 && (
        <ul className="low-stock-list divide-y divide-slate-200 list-none p-0 m-0">
          {products.map((product) => {
            const isOut = product.productStock === 0
            const isLow = product.productStock < product.minimumProductStock

            return (
              <li
                key={product._id}
                className="low-stock-item stock-row-item px-6 py-4 flex justify-between items-center gap-4"
              >
                <div className="flex-1">
                  <h3 className="low-stock-item-title font-medium text-slate-900">
                    {product.productName}
                  </h3>
                  {product.productDescription && (
                    <p className="text-sm text-slate-400 mt-1">
                      {product.productDescription}
                    </p>
                  )}
                  <p className="low-stock-item-meta text-sm text-slate-500 mt-1">
                    Precio:{' '}
                    <strong className="low-stock-item-value text-slate-700">
                      {formatPrice(product.productPrice)}
                    </strong>{' '}
                    · Stock:{' '}
                    <strong className="low-stock-item-value text-slate-700">
                      {product.productStock}
                    </strong>
                  </p>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    isOut
                      ? 'low-stock-badge low-stock-badge-out'
                      : isLow
                        ? 'low-stock-badge'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isOut ? 'Agotado' : isLow ? 'Bajo' : 'Disponible'}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default ProductLookup
