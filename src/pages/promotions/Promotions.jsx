import PageShell from '@/components/templates/PageShell'
import { formatMoney, formatPercent } from '@/utils/commonFunctions'
import { todayLocal } from '@/utils/dateDisplay'
import { useState } from 'react'
import { notifyError } from '@/libs/handleErrors'
import { useGetPromotionPages } from '@/features/products.features'
import { getAllPromotionProducts } from '@/services/products.services'
import { useGetCategories } from '@/features/categories.features'
import FormFilter from '@/components/molecules/FormFilter'
import useFilterQuery from '@/hooks/useFilterQuery'
import InfiniteScrollFooter from '@/components/molecules/InfiniteScrollFooter'
import { Button } from '@/components/atoms/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/atoms/card'
import { Label } from '@/components/atoms/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/atoms/select'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/atoms/table'
import ListSkeleton from '@/components/molecules/ListSkeleton'

const Promotions = () => {
  const [dataFilter, setDataFilter] = useFilterQuery('q')
  const [category, setCategory] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const search = dataFilter.trim()
  const { data: categories } = useGetCategories()
  const {
    data: pages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetPromotionPages(search, category)

  const products = pages?.pages.flatMap((page) => page.data) || []
  const total = pages?.pages[0]?.total ?? 0

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const { exportPromotionsToExcel } = await import('@/utils/exportExcel')
      const rows = await getAllPromotionProducts(search, category)
      await exportPromotionsToExcel(rows, `promociones_${todayLocal()}.xlsx`)
    } catch (error) {
      notifyError(error, 'No se pudieron exportar las promociones a Excel')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <PageShell>
      <Card as="section" aria-labelledby="promotions-title">
        <CardHeader>
          <div>
            <CardTitle>
              <h1 id="promotions-title" className="text-xl font-bold">
                Promociones
              </h1>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Productos con margen de 30% o más sobre el precio de venta
            </p>
          </div>
          <CardAction>
            <Button
              type="button"
              variant="outline"
              onClick={handleExport}
              disabled={isLoading || isExporting || total === 0}
            >
              {isExporting ? 'Exportando...' : 'Exportar a Excel'}
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <FormFilter
            id="promotions-filter"
            label="Buscar producto"
            placeholder="Buscar en promociones..."
            value={dataFilter}
            onChange={setDataFilter}
          >
            <div className="flex min-w-[200px] flex-col gap-2">
              <Label htmlFor="promotions-category" className="mb-0">
                Categoría
              </Label>
              <Select
                value={category || 'all'}
                onValueChange={(value) =>
                  setCategory(value === 'all' ? '' : value)
                }
              >
                <SelectTrigger id="promotions-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories?.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.categories}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FormFilter>

          {isLoading ? (
            <ListSkeleton />
          ) : (
            <>
              <div className="space-y-3 xl:hidden">
                {products.length > 0 ? (
                  products.map((product) => (
                    <Card as="article" key={product._id} className="gap-3 py-4">
                      <CardContent className="space-y-3 px-4">
                        <div className="min-w-0">
                          <h2 className="break-words font-medium">
                            {product.productName}
                          </h2>
                          {product.productDescription && (
                            <p className="break-words text-xs text-muted-foreground">
                              {product.productDescription}
                            </p>
                          )}
                        </div>
                        <dl className="grid grid-cols-3 gap-x-4 text-sm">
                          <div>
                            <dt className="text-xs text-muted-foreground">
                              Compra
                            </dt>
                            <dd>{formatMoney(product.purchasePrice)}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground">
                              Venta
                            </dt>
                            <dd>{formatMoney(product.productPrice)}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground">
                              Margen
                            </dt>
                            <dd className="font-medium">
                              {formatPercent(product.margin)}
                            </dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="rounded-lg border p-8 text-center text-muted-foreground">
                    No hay productos con margen de 30% o más
                  </p>
                )}
                <footer className="text-center text-sm text-muted-foreground">
                  Total: {total}
                </footer>
              </div>

              <div className="hidden rounded-lg border xl:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Compra</TableHead>
                      <TableHead className="text-right">Venta</TableHead>
                      <TableHead className="text-right">Margen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length > 0 ? (
                      products.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>
                            <strong>{product.productName}</strong>
                            {product.productDescription && (
                              <div className="text-xs text-muted-foreground">
                                {product.productDescription}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {product.category?.categories || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatMoney(product.purchasePrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatMoney(product.productPrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            <strong>{formatPercent(product.margin)}</strong>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="p-8 text-center text-muted-foreground"
                        >
                          No hay productos con margen de 30% o más
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  <TableCaption>Total: {total}</TableCaption>
                </Table>
              </div>
              <div>
                <InfiniteScrollFooter
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  fetchNextPage={fetchNextPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}

export default Promotions
