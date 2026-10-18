import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
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
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-center">Opciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category?._id}>
              <TableCell>{category?.categories}</TableCell>
              <TableCell className="text-center">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <caption className="mt-2 pb-2 text-sm text-muted-foreground">
          Total: {total ?? categories.length}
        </caption>
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

export default TableCategories
