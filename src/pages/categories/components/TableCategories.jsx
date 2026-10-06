import useIntersectionPagination from '@/hooks/useIntersectionPagination'
import ActionIconButton from '@/components/ActionIconButton'
import Loading from '@/ui/Loading'

const TableCategories = ({
  categories,
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
            <th>Categoría</th>
            <th className="text-center">Opciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category?._id}>
              <td>{category?.categories}</td>
              <td className="text-center">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                  <ActionIconButton
                    action="edit"
                    label="Editar"
                    onClick={() => handleUpdate(category)}
                  />
                  <ActionIconButton
                    action="delete"
                    label="Eliminar"
                    onClick={() => handleDelete(category?._id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <caption className="text-sm text-gray-500 mt-2">
          Total: {total ?? categories.length}
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

export default TableCategories
