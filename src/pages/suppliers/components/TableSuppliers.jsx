import useIntersectionPagination from '@/hooks/useIntersectionPagination'
import ActionIconButton from '@/components/ActionIconButton'
import Loading from '@/ui/Loading'

const TableSuppliers = ({
  suppliers,
  total,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  handleUpdate,
  handleDelete
}) => {
  const { sentinelRef, supportsIntersectionObserver } =
    useIntersectionPagination(fetchNextPage, hasNextPage && !isFetchingNextPage)

  return (
    <div className="table-wrapper">
      <table className="table-minimal">
        <thead>
          <tr>
            <th>Proveedor</th>
            <th>Contacto</th>
            <th>Teléfono</th>
            <th>Pedido</th>
            <th>Entrega</th>
            <th>Activo</th>
            <th className="text-center">Opciones</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier?._id}>
              <td>{supplier?.suppliersName}</td>
              <td>{supplier?.suppliersContact}</td>
              <td>{supplier?.supplierPhone}</td>
              <td>{supplier?.raiseOrder}</td>
              <td>{supplier?.deliverOrder}</td>
              <td>
                <span
                  className={`badge-minimal ${supplier?.isActive ? 'badge-success' : 'badge-danger'}`}
                >
                  {supplier?.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="text-center">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                  <ActionIconButton
                    action="edit"
                    label="Editar"
                    onClick={() => handleUpdate(supplier)}
                  />
                  <ActionIconButton
                    action="delete"
                    label="Eliminar"
                    onClick={() => handleDelete(supplier?._id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <caption className="text-sm text-gray-500 mt-2">
          Total: {total ?? suppliers.length}
        </caption>
      </table>
      {hasNextPage && supportsIntersectionObserver && (
        <div ref={sentinelRef} className="h-1" aria-hidden="true" />
      )}
      {isFetchingNextPage && supportsIntersectionObserver && (
        <Loading fullScreen={false} />
      )}
      {hasNextPage && !supportsIntersectionObserver && (
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

export default TableSuppliers
