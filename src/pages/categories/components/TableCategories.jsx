import { Card, CardContent } from '@/components/ui/card'
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

const TableCategories = ({
  categories,
  total,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  handleUpdate,
  handleDelete
}) => {
  return (
    <div>
      <div className="space-y-3 xl:hidden">
        {categories.map((category) => (
          <Card as="article" key={category?._id} className="gap-3 py-4">
            <CardContent className="space-y-3 px-4">
              <h2 className="break-words font-medium">
                {category?.categories}
              </h2>

              <div className="flex items-center justify-end gap-2 border-t pt-3">
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
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="hidden rounded-lg border xl:block">
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
      </div>
      <InfiniteScrollFooter
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    </div>
  )
}

export default TableCategories
