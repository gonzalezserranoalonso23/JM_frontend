import { formatQty } from '@/utils/commonFunctions'
import { useRef } from 'react'
import { Check, X } from 'lucide-react'
import useIntersectionPagination from '@/hooks/useIntersectionPagination'
import ActionIconButton from '@/components/ActionIconButton'
import Loading from '@/ui/Loading'
import ListSkeleton from '@/components/ListSkeleton'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'

const TableProducts = ({
  products,
  total,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  isLoading,
  isError,
  handleUpdate,
  handleDelete,
  handleToggleActive,
  canManage = true
}) => {
  const tableContainerRef = useRef(null)
  // Only the desktop table scrolls internally; on mobile the page scrolls.
  const desktopRootRef = {
    get current() {
      return window.matchMedia('(min-width: 1280px)').matches
        ? tableContainerRef.current
        : null
    }
  }
  const { sentinelRef, supportsIntersectionObserver } =
    useIntersectionPagination(
      fetchNextPage,
      hasNextPage && !isFetchingNextPage,
      desktopRootRef
    )

  return (
    <div
      ref={tableContainerRef}
      className="xl:h-[calc(var(--app-vh)*70)] xl:min-h-[18rem] xl:overflow-y-auto xl:rounded-lg xl:border"
      aria-busy={isLoading || isFetchingNextPage}
    >
      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <Alert variant="destructive" className="m-4 w-auto">
          Error al cargar los productos
        </Alert>
      ) : products.length === 0 ? (
        <div className="flex h-64 items-center justify-center lg:h-full">
          <Alert className="w-auto">No hay productos para mostrar</Alert>
        </div>
      ) : (
        <>
          <div className="space-y-3 xl:hidden">
            {products.map((product) => (
              <Card as="article" key={product?._id} className="gap-3 py-4">
                <CardContent className="space-y-3 px-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words font-medium">
                        {product?.productName}
                      </h2>
                      {product?.productDescription && (
                        <p className="break-words text-xs text-muted-foreground">
                          {product.productDescription}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        product?.productStock === 0 ? 'destructive' : 'outline'
                      }
                      className={
                        product?.productStock === 0
                          ? 'shrink-0'
                          : `shrink-0 ${
                              product?.productStock <
                              product?.minimumProductStock
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`
                      }
                    >
                      Stock {formatQty(product?.productStock)}
                    </Badge>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Compra</dt>
                      <dd>${formatQty(product?.purchasePrice)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Venta</dt>
                      <dd>${formatQty(product?.productPrice)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Stock mín.
                      </dt>
                      <dd>{formatQty(product?.minimumProductStock)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Estado</dt>
                      <dd className="flex items-center gap-1">
                        {product?.isActive === false ? (
                          <X className="h-4 w-4 text-destructive" />
                        ) : (
                          <Check className="h-4 w-4 text-emerald-400" />
                        )}
                        {product?.isActive === false
                          ? 'Desactivado'
                          : 'Activado'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Proveedor
                      </dt>
                      <dd className="break-words">
                        {product?.supplier?.suppliersName ||
                          product?.supplier?.name ||
                          'Sin proveedor'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Categoría
                      </dt>
                      <dd className="break-words">
                        {product?.category?.categories || 'Sin categoría'}
                      </dd>
                    </div>
                  </dl>
                  {canManage && (
                    <div className="flex items-center justify-end gap-2 border-t pt-3">
                      <ActionIconButton
                        action="edit"
                        label="Editar"
                        onClick={() => handleUpdate(product)}
                      />
                      <ActionIconButton
                        action={
                          product?.isActive === false
                            ? 'activate'
                            : 'deactivate'
                        }
                        label={
                          product?.isActive === false ? 'Activar' : 'Desactivar'
                        }
                        onClick={() => handleToggleActive(product)}
                      />
                      <ActionIconButton
                        action="delete"
                        label="Eliminar"
                        onClick={() => handleDelete(product?._id)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            <footer className="pb-2 text-center text-sm text-muted-foreground">
              Total: {total ?? products.length} productos
            </footer>
          </div>
          <Table className="hidden xl:table">
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Descripción
                </TableHead>
                <TableHead className="hidden lg:table-cell">Compra</TableHead>
                <TableHead className="hidden lg:table-cell">Venta</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Stock mín.
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  Proveedor
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  Categoría
                </TableHead>
                <TableHead className="hidden text-center lg:table-cell">
                  Estado
                </TableHead>
                {canManage && (
                  <TableHead className="text-center">Acciones</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product?._id}>
                  <TableCell>
                    <strong className="break-words font-medium">
                      {product?.productName}
                    </strong>
                    <div className="mt-1 space-y-0.5 break-words text-xs text-muted-foreground lg:hidden">
                      {product?.productDescription && (
                        <p>{product.productDescription}</p>
                      )}
                      <p>
                        Compra ${formatQty(product?.purchasePrice)} · Venta $
                        {formatQty(product?.productPrice)}
                      </p>
                      <p>
                        {product?.supplier?.suppliersName ||
                          product?.supplier?.name ||
                          'Sin proveedor'}{' '}
                        · {product?.category?.categories || 'Sin categoría'}
                      </p>
                      <p className="flex items-center gap-1">
                        {product?.isActive === false ? (
                          <X className="h-3.5 w-3.5 text-destructive" />
                        ) : (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        )}
                        {product?.isActive === false
                          ? 'Desactivado'
                          : 'Activado'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <small>{product?.productDescription}</small>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    ${formatQty(product?.purchasePrice)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    ${formatQty(product?.productPrice)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product?.productStock === 0 ? 'destructive' : 'outline'
                      }
                      className={
                        product?.productStock === 0
                          ? undefined
                          : product?.productStock < product?.minimumProductStock
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                      }
                    >
                      {formatQty(product?.productStock)}
                    </Badge>
                    <span className="mt-1 block text-xs text-muted-foreground lg:hidden">
                      Mín. {formatQty(product?.minimumProductStock)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatQty(product?.minimumProductStock)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <small>{product?.supplier?.suppliersName}</small>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <small>{product?.category?.categories}</small>
                  </TableCell>
                  <TableCell className="hidden text-center lg:table-cell">
                    {product?.isActive === false ? (
                      <X
                        className="h-5 w-5 text-destructive"
                        aria-label="Desactivado"
                      />
                    ) : (
                      <Check
                        className="h-5 w-5 text-emerald-400"
                        aria-label="Activado"
                      />
                    )}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-center">
                      <div className="flex w-full flex-row items-center justify-center gap-1">
                        <ActionIconButton
                          action="edit"
                          label="Editar"
                          onClick={() => handleUpdate(product)}
                        />
                        <ActionIconButton
                          action={
                            product?.isActive === false
                              ? 'activate'
                              : 'deactivate'
                          }
                          label={
                            product?.isActive === false
                              ? 'Activar'
                              : 'Desactivar'
                          }
                          onClick={() => handleToggleActive(product)}
                        />
                        <ActionIconButton
                          action="delete"
                          label="Eliminar"
                          onClick={() => handleDelete(product?._id)}
                        />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
            <caption className="mt-2 pb-2 text-sm text-muted-foreground">
              Total: {total ?? products.length} productos
            </caption>
          </Table>
        </>
      )}
      {!isLoading &&
        !isError &&
        hasNextPage &&
        supportsIntersectionObserver && (
          <div ref={sentinelRef} className="h-1" aria-hidden="true" />
        )}
      {isFetchingNextPage && supportsIntersectionObserver && (
        <Loading fullScreen={false} />
      )}
      {!isLoading &&
        !isError &&
        hasNextPage &&
        !supportsIntersectionObserver && (
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? <Loading fullScreen={false} /> : 'Cargar más'}
          </Button>
        )}
    </div>
  )
}

export default TableProducts
