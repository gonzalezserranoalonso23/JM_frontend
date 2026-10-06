import { useRef } from 'react'
import { Check, X } from 'lucide-react'
import useIntersectionPagination from '@/hooks/useIntersectionPagination'
import ActionIconButton from '@/components/ActionIconButton'
import Loading from '@/ui/Loading'

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
  handleToggleActive
}) => {
  const tableContainerRef = useRef(null)
  const { sentinelRef, supportsIntersectionObserver } =
    useIntersectionPagination(
      fetchNextPage,
      hasNextPage && !isFetchingNextPage,
      tableContainerRef
    )

  return (
    <div
      ref={tableContainerRef}
      className="table-wrapper products-table-wrapper h-[70vh] min-h-[18rem] overflow-y-auto"
      aria-busy={isLoading || isFetchingNextPage}
    >
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Loading fullScreen={false} />
        </div>
      ) : isError ? (
        <div className="alert-minimal alert-danger-minimal m-4">
          Error al cargar los productos
        </div>
      ) : products.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="alert-minimal alert-warning-minimal">
            No hay productos para mostrar
          </div>
        </div>
      ) : (
        <table className="table-minimal products-table">
          <thead className="sticky top-0 z-10">
            <tr>
              <th>Producto</th>
              <th className="mobile-expand hidden lg:table-cell">
                Descripción
              </th>
              <th className="mobile-expand hidden lg:table-cell">Compra</th>
              <th className="mobile-expand hidden lg:table-cell">Venta</th>
              <th>Stock</th>
              <th className="mobile-expand hidden lg:table-cell">Stock mín.</th>
              <th className="mobile-expand hidden lg:table-cell">Proveedor</th>
              <th className="mobile-expand hidden lg:table-cell">Categoría</th>
              <th className="mobile-expand hidden text-center lg:table-cell">
                Estado
              </th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product?._id}>
                <td>
                  <strong className="break-words">
                    {product?.productName}
                  </strong>
                  <div className="mobile-summary mt-1 space-y-0.5 break-words text-xs text-slate-500 lg:hidden">
                    {product?.productDescription && (
                      <p>{product.productDescription}</p>
                    )}
                    <p>
                      Compra ${product?.purchasePrice ?? 0} · Venta $
                      {product?.productPrice ?? 0}
                    </p>
                    <p>
                      {product?.supplier?.suppliersName ||
                        product?.supplier?.name ||
                        'Sin proveedor'}{' '}
                      · {product?.category?.categories || 'Sin categoría'}
                    </p>
                    <p className="flex items-center gap-1">
                      {product?.isActive === false ? (
                        <X className="h-3.5 w-3.5 text-red-600" />
                      ) : (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      )}
                      {product?.isActive === false ? 'Desactivado' : 'Activado'}
                    </p>
                  </div>
                </td>
                <td className="mobile-expand hidden lg:table-cell">
                  <small>{product?.productDescription}</small>
                </td>
                <td className="mobile-expand hidden lg:table-cell">
                  ${product?.purchasePrice ?? 0}
                </td>
                <td className="mobile-expand hidden lg:table-cell">
                  ${product?.productPrice ?? 0}
                </td>
                <td>
                  <span
                    className={`badge-minimal ${
                      product?.productStock === 0
                        ? 'badge-danger'
                        : product?.productStock < product?.minimumProductStock
                          ? 'badge-warning'
                          : 'badge-success'
                    }`}
                  >
                    {product?.productStock}
                  </span>
                  <span className="mobile-summary mt-1 block text-xs text-slate-500 lg:hidden">
                    Mín. {product?.minimumProductStock ?? 0}
                  </span>
                </td>
                <td className="mobile-expand hidden lg:table-cell">
                  {product?.minimumProductStock}
                </td>
                <td className="mobile-expand hidden lg:table-cell">
                  <small>{product?.supplier?.suppliersName}</small>
                </td>
                <td className="mobile-expand hidden lg:table-cell">
                  <small>{product?.category?.categories}</small>
                </td>
                <td className="mobile-expand hidden text-center lg:table-cell">
                  {product?.isActive === false ? (
                    <X
                      className="h-5 w-5 text-red-600"
                      aria-label="Desactivado"
                    />
                  ) : (
                    <Check
                      className="h-5 w-5 text-green-600"
                      aria-label="Activado"
                    />
                  )}
                </td>
                <td className="text-center">
                  <div className="flex w-full flex-row items-center justify-center gap-1">
                    <ActionIconButton
                      action="edit"
                      label="Editar"
                      onClick={() => handleUpdate(product)}
                    />
                    <ActionIconButton
                      action={
                        product?.isActive === false ? 'activate' : 'deactivate'
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
                </td>
              </tr>
            ))}
          </tbody>
          <caption className="text-sm text-gray-500 mt-2">
            Total: {total ?? products.length} productos
          </caption>
        </table>
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
          <button
            type="button"
            className="w-full py-3 text-sm font-medium"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? <Loading fullScreen={false} /> : 'Cargar más'}
          </button>
        )}
    </div>
  )
}

export default TableProducts
