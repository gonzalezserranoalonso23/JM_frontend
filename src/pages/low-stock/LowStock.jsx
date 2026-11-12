import PageShell from '@/components/templates/PageShell'
import { formatQty } from '@/utils/commonFunctions'
import { useGetLowStockProductPages } from '@/features/inventory.features'
import { Alert, AlertDescription } from '@/components/atoms/alert'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/atoms/card'
import Loading from '@/components/atoms/Loading'
import Skeleton from '@/components/atoms/skeleton'
import FormFilter from '@/components/molecules/FormFilter'
import useFilterQuery from '@/hooks/useFilterQuery'
import useIntersectionPagination from '@/hooks/useIntersectionPagination'

const LowStock = () => {
  const [dataFilter, setDataFilter] = useFilterQuery('low-stock')
  const {
    data: lowStockPages,
    isLoading: lowStockLoading,
    isError: lowStockError,
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

  return (
    <PageShell>
      <Card
        as="section"
        className="mb-8 gap-0 overflow-hidden py-0"
        aria-labelledby="low-stock-title"
      >
        <CardHeader className="border-b py-4">
          <CardTitle>
            <h2 id="low-stock-title" className="font-semibold">
              {lowStockLoading || lowStockTotal === 0
                ? 'Productos con stock bajo'
                : `⚠️ ${lowStockTotal} productos con stock bajo`}
            </h2>
          </CardTitle>
        </CardHeader>
        {lowStockLoading ? (
          <div role="status" aria-label="Cargando">
            <div className="px-6 py-4">
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="h-9 w-full" />
            </div>
            <ul className="m-0 list-none divide-y border-t p-0">
              {Array.from({ length: 5 }, (_, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
                </li>
              ))}
            </ul>
          </div>
        ) : lowStockError ? (
          <Alert variant="destructive" className="m-6 w-auto">
            <AlertDescription>No se pudo cargar el stock.</AlertDescription>
          </Alert>
        ) : lowStockTotal === 0 && !dataFilter ? (
          <Alert className="m-6 w-auto">
            <AlertDescription className="font-medium">
              ✓ Todo está bien - Todos los productos tienen stock suficiente
            </AlertDescription>
          </Alert>
        ) : (
          <>
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
                <li key={product._id}>
                  <article className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-medium text-foreground">
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
                    <div className="shrink-0">
                      {product.productStock === 0 ? (
                        <Badge variant="destructive">Agotado</Badge>
                      ) : (
                        <Badge className="border-transparent bg-yellow-600 text-white">
                          Bajo
                        </Badge>
                      )}
                    </div>
                  </article>
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
          </>
        )}
      </Card>
    </PageShell>
  )
}

export default LowStock
