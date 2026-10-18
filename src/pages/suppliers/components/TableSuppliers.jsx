import { Badge } from '@/components/ui/badge'
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
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Proveedor</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Pedido</TableHead>
            <TableHead>Entrega</TableHead>
            <TableHead>Activo</TableHead>
            <TableHead className="text-center">Opciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier?._id}>
              <TableCell>{supplier?.suppliersName}</TableCell>
              <TableCell>{supplier?.suppliersContact}</TableCell>
              <TableCell>{supplier?.supplierPhone}</TableCell>
              <TableCell>{supplier?.raiseOrder}</TableCell>
              <TableCell>{supplier?.deliverOrder}</TableCell>
              <TableCell>
                <Badge
                  variant={supplier?.isActive ? 'outline' : 'destructive'}
                  className={
                    supplier?.isActive ? 'text-emerald-400' : undefined
                  }
                >
                  {supplier?.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <caption className="mt-2 pb-2 text-sm text-muted-foreground">
          Total: {total ?? suppliers.length}
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

export default TableSuppliers
