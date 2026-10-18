import { useState } from 'react'
import { useGetLowStockProductPages } from '@/features/inventory.features'
import { useGetCategories } from '@/features/categories.features'
import FormFilter from '@/components/FormFilter'
import useFilterQuery from '@/hooks/useFilterQuery'
import useIntersectionPagination from '@/hooks/useIntersectionPagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  const { sentinelRef, supportsIntersectionObserver } =
    useIntersectionPagination(
      fetchNextPage,
      Boolean(hasNextPage) && !isFetchingNextPage
    )

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

            <div className="rounded-lg border">
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
                          {product.productStock}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Shortages
