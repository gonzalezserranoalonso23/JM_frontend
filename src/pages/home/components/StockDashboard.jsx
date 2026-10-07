import {
  useGetInventoryStats,
  useGetLowStockProductPages
} from '@/features/inventory.features'
import DailyInformationDashboard from './DailyInformationDashboard'
import Loading from '@/ui/Loading'
import useIntersectionPagination from '@/hooks/useIntersectionPagination'

const StockDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useGetInventoryStats()
  const {
    data: lowStockPages,
    isLoading: lowStockLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetLowStockProductPages()
  const lowStockProducts =
    lowStockPages?.pages.flatMap((page) => page.data) || []
  const lowStockTotal = lowStockPages?.pages[0]?.total || 0
  const { sentinelRef, supportsIntersectionObserver } =
    useIntersectionPagination(
      fetchNextPage,
      Boolean(hasNextPage) && !isFetchingNextPage
    )

  if (statsLoading || lowStockLoading) return <Loading />

  return (
    <div className="bg-[var(--bg-page)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 page-content-shell">
        <section
          className="dashboard-shell home-dashboard-shell mt-6 mb-8"
          aria-labelledby="dashboard-title"
        >
          {/* Header */}
          <header className="mb-8">
            <h1
              id="dashboard-title"
              className="text-3xl font-bold text-slate-900"
            >
              Dashboard
            </h1>
            <p className="text-slate-500 mt-2">Resumen del sistema</p>
          </header>

          <DailyInformationDashboard />

          {/* Stats Cards */}
          <section
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 auto-rows-fr"
            aria-label="Indicadores de inventario"
          >
            {/* Total Productos */}
            <article className="dashboard-card home-dashboard-card fixed-dashboard-card fixed-kpi-card border-l-slate-300 h-full min-h-[120px] sm:min-h-[170px] rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] p-4 sm:p-6 border border-slate-200 border-l-4">
              <h2 className="fixed-kpi-label text-slate-500 text-sm font-medium mb-2">
                Productos
              </h2>
              <p className="fixed-kpi-value text-3xl font-bold text-slate-900">
                {stats?.totalProducts || 0}
              </p>
            </article>

            {/* Valor Inventario */}
            <article className="dashboard-card home-dashboard-card fixed-dashboard-card fixed-kpi-card border-l-slate-400 h-full min-h-[120px] sm:min-h-[170px] rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] p-4 sm:p-6 border border-slate-200 border-l-4">
              <h2 className="fixed-kpi-label text-slate-500 text-sm font-medium mb-2">
                Valor Inv.
              </h2>
              <p className="fixed-kpi-value text-3xl font-bold text-slate-900">
                ${(stats?.totalInventoryValue || 0).toFixed(0)}
              </p>
            </article>

            {/* Stock Bajo */}
            <article className="dashboard-card home-dashboard-card fixed-dashboard-card fixed-kpi-card border-l-slate-500 h-full min-h-[120px] sm:min-h-[170px] rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] p-4 sm:p-6 border border-slate-200 border-l-4">
              <h2 className="fixed-kpi-label text-slate-500 text-sm font-medium mb-2">
                Stock Bajo
              </h2>
              <p className="fixed-kpi-value text-3xl font-bold text-slate-900">
                {stats?.lowStockProducts || 0}
              </p>
            </article>

            {/* Sin Stock */}
            <article className="dashboard-card home-dashboard-card fixed-dashboard-card fixed-kpi-card border-l-slate-600 h-full min-h-[120px] sm:min-h-[170px] rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] p-4 sm:p-6 border border-slate-200 border-l-4">
              <h2 className="fixed-kpi-label text-slate-500 text-sm font-medium mb-2">
                Sin Stock
              </h2>
              <p className="fixed-kpi-value text-3xl font-bold text-slate-900">
                {stats?.outOfStockProducts || 0}
              </p>
            </article>
          </section>

          {/* Alertas de Stock Bajo */}
          {lowStockTotal > 0 && (
            <section
              className="dashboard-card home-dashboard-card h-full min-h-[220px] rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] overflow-hidden mb-8 border border-slate-200"
              aria-labelledby="low-stock-title"
            >
              <header className="low-stock-header px-6 py-4">
                <h2 id="low-stock-title" className="font-semibold">
                  ⚠️ {lowStockTotal} productos con stock bajo
                </h2>
              </header>
              <ul className="low-stock-list divide-y divide-slate-200 list-none p-0 m-0">
                {lowStockProducts.map((product) => (
                  <li
                    key={product._id}
                    className="low-stock-item stock-row-item px-6 py-4 flex justify-between items-center"
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
                        Stock:{' '}
                        <strong className="low-stock-item-value text-slate-700">
                          {product.productStock}
                        </strong>{' '}
                        / Mín: {product.minimumProductStock}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`low-stock-badge inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          product.productStock === 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {product.productStock === 0 ? 'Agotado' : 'Bajo'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              {hasNextPage && supportsIntersectionObserver && (
                <div ref={sentinelRef} className="h-1" aria-hidden="true" />
              )}
              {isFetchingNextPage && supportsIntersectionObserver && (
                <Loading fullScreen={false} />
              )}
              {hasNextPage && !supportsIntersectionObserver && (
                <button
                  type="button"
                  className="w-full px-4 py-3 text-sm font-medium text-slate-700"
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
            </section>
          )}

          {/* Mensaje de Éxito */}
          {!lowStockLoading && lowStockTotal === 0 && (
            <div
              className="px-6 py-4 rounded-xl"
              style={{
                backgroundColor: '#1f2937',
                borderLeft: '4px solid #6b7280'
              }}
            >
              <p className="font-medium" style={{ color: '#d1d5db' }}>
                ✓ Todo está bien - Todos los productos tienen stock suficiente
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default StockDashboard
