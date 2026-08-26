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
    <div className="min-h-screen bg-light pt-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark">Inventario</h1>
          <p className="text-muted mt-2">Resumen del sistema</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Productos */}
          <div className="bg-white rounded-md shadow-sm p-6 border-l-4 border-primary">
            <div className="text-muted text-sm font-medium mb-2">Productos</div>
            <div className="text-3xl font-bold text-dark">
              {stats?.totalProducts || 0}
            </div>
          </div>

          {/* Valor Inventario */}
          <div className="bg-white rounded-md shadow-sm p-6 border-l-4 border-success">
            <div className="text-muted text-sm font-medium mb-2">
              Valor Inv.
            </div>
            <div className="text-3xl font-bold text-success">
              ${(stats?.totalInventoryValue || 0).toFixed(0)}
            </div>
          </div>

          {/* Stock Bajo */}
          <div className="bg-white rounded-md shadow-sm p-6 border-l-4 border-warning">
            <div className="text-muted text-sm font-medium mb-2">
              Stock Bajo
            </div>
            <div className="text-3xl font-bold text-warning">
              {stats?.lowStockProducts || 0}
            </div>
          </div>

          {/* Sin Stock */}
          <div className="bg-white rounded-md shadow-sm p-6 border-l-4 border-danger">
            <div className="text-muted text-sm font-medium mb-2">Sin Stock</div>
            <div className="text-3xl font-bold text-danger">
              {stats?.outOfStockProducts || 0}
            </div>
          </div>
        </div>

        {/* Ventas Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Ventas Hoy */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <h3 className="text-muted text-sm font-medium mb-4">Ventas Hoy</h3>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-muted text-xs mb-1">Total</div>
                <div className="text-2xl font-bold text-dark">
                  ${(dailySales?.totalSales || 0).toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-muted text-xs mb-1">
                  {dailySales?.totalTransactions || 0}
                </div>
                <div className="text-muted text-xs">transacciones</div>
              </div>
            </div>
          </div>

          {/* Total Vendido */}
          <div className="bg-white rounded-md shadow-sm p-6">
            <h3 className="text-muted text-sm font-medium mb-4">
              Total Vendido
            </h3>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-muted text-xs mb-1">Valor</div>
                <div className="text-2xl font-bold text-dark">
                  ${(stats?.totalSalesValue || 0).toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-muted text-xs mb-1">
                  {stats?.totalMovements || 0}
                </div>
                <div className="text-muted text-xs">movimientos</div>
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
          <div className="bg-white rounded-md shadow-sm overflow-hidden mb-8">
            <div className="bg-yellow-50 border-l-4 border-warning px-6 py-4">
              <h3 className="font-semibold text-warning">
                ⚠️ {lowStockProducts.length} productos con stock bajo
              </h3>
            </div>
            <div className="divide-y">
              {lowStockProducts.map((product) => (
                <div
                  key={product._id}
                  className="px-6 py-4 flex justify-between items-center hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-dark">
                      {product.productName}
                    </h4>
                    <p className="text-sm text-muted mt-1">
                      Stock: <strong>{product.productStock}</strong> / Mín:{' '}
                      {product.minimumProductStock}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        product.productStock === 0
                          ? 'bg-red-100 text-danger'
                          : 'bg-yellow-100 text-warning'
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
          <div className="bg-green-50 border-l-4 border-success px-6 py-4 rounded-md">
            <p className="text-success font-medium">
              ✓ Todo está bien - Todos los productos tienen stock suficiente
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StockDashboard
