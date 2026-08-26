import {
  useGetInventoryStats,
  useGetLowStockProducts,
  useGetDailySalesSummary
} from '../../../features/inventory.features'
import TaskWidget from './TaskWidget'
import Loading from '../../../ui/Loading'

const StockDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useGetInventoryStats()
  const { data: lowStockProducts, isLoading: lowStockLoading } =
    useGetLowStockProducts()
  const today = new Date().toISOString().split('T')[0]
  const { data: dailySales, isLoading: salesLoading } =
    useGetDailySalesSummary(today)

  if (statsLoading || lowStockLoading || salesLoading) return <Loading />

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="dashboard-shell home-dashboard-shell mt-6 mb-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-2">Resumen del sistema</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 auto-rows-fr">
            {/* Total Productos */}
            <div className="dashboard-card home-dashboard-card fixed-dashboard-card fixed-kpi-card border-l-slate-300 h-full min-h-[170px] rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] p-6 border border-slate-200 border-l-4">
              <div className="fixed-kpi-label text-slate-500 text-sm font-medium mb-2">
                Productos
              </div>
              <div className="fixed-kpi-value text-3xl font-bold text-slate-900">
                {stats?.totalProducts || 0}
              </div>
            </div>

            {/* Valor Inventario */}
            <div className="dashboard-card home-dashboard-card fixed-dashboard-card fixed-kpi-card border-l-slate-400 h-full min-h-[170px] rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] p-6 border border-slate-200 border-l-4">
              <div className="fixed-kpi-label text-slate-500 text-sm font-medium mb-2">
                Valor Inv.
              </div>
              <div className="fixed-kpi-value text-3xl font-bold text-slate-900">
                ${(stats?.totalInventoryValue || 0).toFixed(0)}
              </div>
            </div>

            {/* Stock Bajo */}
            <div className="dashboard-card home-dashboard-card fixed-dashboard-card fixed-kpi-card border-l-slate-500 h-full min-h-[170px] rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] p-6 border border-slate-200 border-l-4">
              <div className="fixed-kpi-label text-slate-500 text-sm font-medium mb-2">
                Stock Bajo
              </div>
              <div className="fixed-kpi-value text-3xl font-bold text-slate-900">
                {stats?.lowStockProducts || 0}
              </div>
            </div>

            {/* Sin Stock */}
            <div className="dashboard-card home-dashboard-card fixed-dashboard-card fixed-kpi-card border-l-slate-600 h-full min-h-[170px] rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] p-6 border border-slate-200 border-l-4">
              <div className="fixed-kpi-label text-slate-500 text-sm font-medium mb-2">
                Sin Stock
              </div>
              <div className="fixed-kpi-value text-3xl font-bold text-slate-900">
                {stats?.outOfStockProducts || 0}
              </div>
            </div>
          </div>

          {/* Ventas Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 auto-rows-fr">
            {/* Ventas Hoy */}
            <div className="dashboard-card home-dashboard-card h-full min-h-[180px] rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] p-6 border border-slate-200">
              <h3 className="text-slate-500 text-sm font-medium mb-4">
                Ventas Hoy
              </h3>
              <div className="flex justify-between items-end h-[calc(100%-2rem)]">
                <div>
                  <div className="text-slate-500 text-xs mb-1">Total</div>
                  <div className="text-2xl font-bold text-slate-900">
                    ${(dailySales?.totalSales || 0).toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-xs mb-1">
                    {dailySales?.totalTransactions || 0}
                  </div>
                  <div className="text-slate-500 text-xs">transacciones</div>
                </div>
              </div>
            </div>

            {/* Total Vendido */}
            <div className="dashboard-card home-dashboard-card h-full min-h-[180px] rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] p-6 border border-slate-200">
              <h3 className="text-slate-500 text-sm font-medium mb-4">
                Total Vendido
              </h3>
              <div className="flex justify-between items-end h-[calc(100%-2rem)]">
                <div>
                  <div className="text-slate-500 text-xs mb-1">Valor</div>
                  <div className="text-2xl font-bold text-slate-900">
                    ${(stats?.totalSalesValue || 0).toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-xs mb-1">
                    {stats?.totalMovements || 0}
                  </div>
                  <div className="text-slate-500 text-xs">movimientos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Task Widget */}
          <div className="mb-8">
            <TaskWidget />
          </div>

          {/* Alertas de Stock Bajo */}
          {lowStockProducts && lowStockProducts.length > 0 && (
            <div className="dashboard-card home-dashboard-card h-full min-h-[220px] rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] overflow-hidden mb-8 border border-slate-200">
              <div className="low-stock-header px-6 py-4">
                <h3 className="font-semibold">
                  ⚠️ {lowStockProducts.length} productos con stock bajo
                </h3>
              </div>
              <div className="low-stock-list divide-y divide-slate-200">
                {lowStockProducts.map((product) => (
                  <div
                    key={product._id}
                    className="low-stock-item stock-row-item px-6 py-4 flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <h4 className="low-stock-item-title font-medium text-slate-900">
                        {product.productName}
                      </h4>
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje de Éxito */}
          {lowStockProducts && lowStockProducts.length === 0 && (
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
        </div>
      </div>
    </div>
  )
}

export default StockDashboard
