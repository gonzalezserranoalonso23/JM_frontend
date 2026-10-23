import PageShell from '@/components/PageShell'
import { formatQty } from '@/utils/commonFunctions'
import {
  useGetInventoryStats,
  useGetLowStockProductPages
} from '@/features/inventory.features'
import ProductLookup from './ProductLookup'
import TodaySalesCard from './TodaySalesCard'
import DailyInformationDashboard from './DailyInformationDashboard'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Loading from '@/ui/Loading'
import FormFilter from '@/components/FormFilter'
import useFilterQuery from '@/hooks/useFilterQuery'
import useIntersectionPagination from '@/hooks/useIntersectionPagination'

const KPIS = (stats) => [
  ['Productos', stats?.totalProducts || 0],
  [
    'Dinero en stock',
    `$${(stats?.totalInventoryValue || 0).toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  ]
]

const StockDashboard = () => {
  const [dataFilter, setDataFilter] = useFilterQuery('stock')
  const { data: stats, isLoading: statsLoading } = useGetInventoryStats()
  const {
    data: lowStockPages,
    isLoading: lowStockLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetLowStockProductPages(dataFilter.trim())
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
    <PageShell>
      <section className="mb-8" aria-labelledby="dashboard-title">
        <header className="mb-6">
          <h1
            id="dashboard-title"
            className="text-2xl font-bold text-foreground sm:text-3xl"
          >
            Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">Resumen del sistema</p>
        </header>

        <div className="mb-6 flex flex-col gap-6 xl:grid xl:grid-cols-2 xl:items-start">
          <TodaySalesCard />
          <ProductLookup />
        </div>

        <DailyInformationDashboard />

        <section
          className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4"
          aria-label="Indicadores de inventario"
        >
          {KPIS(stats).map(([label, value]) => (
            <Card key={label} className="h-full gap-2 p-4 sm:p-6">
              <h2 className="text-sm font-medium text-muted-foreground">
                {label}
              </h2>
              <p className="text-3xl font-bold text-foreground">{value}</p>
            </Card>
          ))}
        </section>

        {(lowStockTotal > 0 || dataFilter) && (
          <Card
            className="mb-8 gap-0 overflow-hidden py-0"
            role="region"
            aria-labelledby="low-stock-title"
          >
            <CardHeader className="border-b py-4">
              <CardTitle>
                <h2 id="low-stock-title" className="font-semibold">
                  ⚠️ {lowStockTotal} productos con stock bajo
                </h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <FormFilter
                id="low-stock-filter"
                label="Buscar producto"
                placeholder="Buscar en stock bajo..."
                value={dataFilter}
                onChange={setDataFilter}
              />
            </CardContent>
            {lowStockProducts.length === 0 && (
              <p className="px-6 py-4 text-sm text-muted-foreground">
                Sin resultados
              </p>
            )}
            <ul className="m-0 list-none divide-y border-t p-0">
              {lowStockProducts.map((product) => (
                <li
                  key={product._id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">
                      {product.productName}
                    </h3>
                    {product.productDescription && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {product.productDescription}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">
                      Stock:{' '}
                      <strong className="text-foreground">
                        {formatQty(product.productStock)}
                      </strong>{' '}
                      / Mín: {product.minimumProductStock}
                    </p>
                  </div>
                  <div>
                    {product.productStock === 0 ? (
                      <Badge variant="destructive">Agotado</Badge>
                    ) : (
                      <Badge className="border-transparent bg-yellow-600 text-white">
                        Bajo
                      </Badge>
                    )}
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
              <Button
                type="button"
                variant="ghost"
                className="w-full rounded-none"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <Loading fullScreen={false} />
                ) : (
                  'Cargar más'
                )}
              </Button>
            )}
          </Card>
        )}

        {!lowStockLoading && lowStockTotal === 0 && !dataFilter && (
          <Alert>
            <AlertDescription className="font-medium">
              ✓ Todo está bien - Todos los productos tienen stock suficiente
            </AlertDescription>
          </Alert>
        )}
      </section>
    </PageShell>
  )
}

export default StockDashboard
