import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'
import InfiniteScrollFooter from '@/components/InfiniteScrollFooter'
import ActionIconButton from '@/components/ActionIconButton'

const TableSuppliers = ({
  suppliers,
  total,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  handleUpdate,
  handleDelete,
  canManage = true
}) => {
  return (
    <div>
      <div className="space-y-3 lg:hidden">
        {suppliers.map((supplier) => (
          <Card key={supplier?._id} className="gap-3 py-4">
            <CardContent className="space-y-3 px-4">
              <div className="flex items-start justify-between gap-3">
                <p className="break-words font-medium">
                  {supplier?.suppliersName}
                </p>
                <Badge
                  variant={supplier?.isActive ? 'outline' : 'destructive'}
                  className={
                    supplier?.isActive
                      ? 'shrink-0 text-emerald-400'
                      : 'shrink-0'
                  }
                >
                  {supplier?.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Contacto</dt>
                  <dd className="break-words">
                    {supplier?.suppliersContact || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Teléfono</dt>
                  <dd className="break-words">
                    {supplier?.supplierPhone || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Pedido</dt>
                  <dd className="break-words">{supplier?.raiseOrder || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Entrega</dt>
                  <dd className="break-words">
                    {supplier?.deliverOrder || '-'}
                  </dd>
                </div>
              </dl>
              {canManage && (
                <div className="flex items-center justify-end gap-2 border-t pt-3">
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
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="hidden rounded-lg border lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proveedor</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Pedido</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Activo</TableHead>
              {canManage && (
                <TableHead className="text-center">Opciones</TableHead>
              )}
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
                {canManage && (
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
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
                )}
              </TableRow>
            ))}
          </TableBody>
          <caption className="mt-2 pb-2 text-sm text-muted-foreground">
            Total: {total ?? suppliers.length}
          </caption>
        </Table>
      </div>
      <InfiniteScrollFooter
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    </div>
  )
}

export default TableSuppliers
