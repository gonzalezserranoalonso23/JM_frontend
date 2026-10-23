import { formatQty } from '@/utils/commonFunctions'
import { useState } from 'react'
import { useGetLowStockProductPages } from '@/features/inventory.features'
import { useGetCategories } from '@/features/categories.features'
import FormFilter from '@/components/FormFilter'
import useFilterQuery from '@/hooks/useFilterQuery'
import InfiniteScrollFooter from '@/components/InfiniteScrollFooter'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import Loading from '@/ui/Loading'

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

  if (isLoading) return <Loading />

  const products = pages?.pages.flatMap((page) => page.data) || []
  const total = pages?.pages[0]?.total ?? 0

  return (
    <div className="py-6">
      <div className="page-content-shell">
        <Card role="region" aria-labelledby="shortages-title">
          <CardHeader>
            <CardTitle>
              <h1 id="shortages-title" className="text-xl font-bold">
                Faltantes
              </h1>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Productos con stock bajo
            </p>
          </CardHeader>

          <CardContent>
            <FormFilter
              id="shortages-filter"
              label="Buscar producto"
              placeholder="Buscar en faltantes..."
              value={dataFilter}
              onChange={setDataFilter}
            >
              <div className="flex min-w-[200px] flex-col gap-2">
                <Label htmlFor="shortages-category" className="mb-0">
                  Categoría
                </Label>
                <Select
                  value={category || 'all'}
                  onValueChange={(value) =>
                    setCategory(value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger id="shortages-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories?.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.categories}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormFilter>

            <div className="space-y-3 lg:hidden">
              {products.length > 0 ? (
                products.map((product) => (
                  <Card key={product._id} className="gap-3 py-4">
                    <CardContent className="space-y-3 px-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words font-medium">
                            {product.productName}
                          </p>
                          {product.productDescription && (
                            <p className="break-words text-xs text-muted-foreground">
                              {product.productDescription}
                            </p>
                          )}
                        </div>
                        {product.productStock === 0 ? (
                          <Badge variant="destructive" className="shrink-0">
                            Agotado
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="shrink-0 text-amber-400"
                          >
                            Bajo
                          </Badge>
                        )}
                      </div>
                      <dl className="grid grid-cols-3 gap-x-4 text-sm">
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Stock
                          </dt>
                          <dd>{formatQty(product.productStock)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Mínimo
                          </dt>
                          <dd>{product.minimumProductStock}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">
                            Categoría
                          </dt>
                          <dd className="break-words">
                            {product.category?.categories || 'N/A'}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="rounded-lg border p-8 text-center text-muted-foreground">
                  No hay productos faltantes
                </p>
              )}
              <p className="text-center text-sm text-muted-foreground">
                Total: {total}
              </p>
            </div>

            <div className="hidden rounded-lg border lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Mínimo</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
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
                        <TableCell className="text-center">
                          {formatQty(product.productStock)}
                        </TableCell>
                        <TableCell className="text-center">
                          {product.minimumProductStock}
                        </TableCell>
                        <TableCell className="text-center">
                          {product.productStock === 0 ? (
                            <Badge variant="destructive">Agotado</Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-700">
                              Bajo
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="p-8 text-center text-muted-foreground"
                      >
                        No hay productos faltantes
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Shortages
