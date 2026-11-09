import { Children, isValidElement } from 'react'
import InfiniteScrollFooter from '@/components/InfiniteScrollFooter'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

// Marca una columna. children puede ser un valor fijo o una función (row) => nodo.
export const Column = () => null

const cellValue = (column, row) => {
  const content = column.props.children
  if (typeof content === 'function') return content(row)
  return content
}

const alignClass = (align) => {
  if (align === 'right') return 'text-right'
  if (align === 'center') return 'text-center'
  return undefined
}

const gridClass = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3'
}

const DataList = ({
  rows,
  rowKey,
  total,
  totalLabel,
  mobileColumns = 2,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  children
}) => {
  const columns = Children.toArray(children).filter(isValidElement)
  const primary =
    columns.find((column) => column.props.primary) ??
    columns.find((column) => !column.props.actions && !column.props.aside)
  const aside = columns.find((column) => column.props.aside)
  const details = columns.filter((column) => column.props.detail)
  const actions = columns.find((column) => column.props.actions)
  const fields = columns.filter(
    (column) =>
      column !== primary &&
      column !== aside &&
      !column.props.detail &&
      !column.props.actions
  )
  const caption = totalLabel ?? `Total: ${total ?? rows.length}`
  const keyOf = (row, index) => {
    if (typeof rowKey === 'function') return rowKey(row)
    return row?._id ?? index
  }

  return (
    <div>
      <div className="space-y-3 xl:hidden">
        {rows.map((row, index) => (
          <Card as="article" key={keyOf(row, index)} className="gap-3 py-4">
            <CardContent className="space-y-3 px-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words font-medium">
                    {primary ? cellValue(primary, row) : null}
                  </h2>
                  {details.map((column) => (
                    <p
                      key={column.props.header}
                      className="break-words text-xs text-muted-foreground"
                    >
                      {cellValue(column, row)}
                    </p>
                  ))}
                </div>
                {aside ? (
                  <div className="shrink-0">{cellValue(aside, row)}</div>
                ) : null}
              </div>
              {fields.length > 0 && (
                <dl
                  className={`grid gap-x-4 gap-y-2 text-sm ${gridClass[mobileColumns] ?? gridClass[2]}`}
                >
                  {fields.map((column) => (
                    <div key={column.props.header}>
                      <dt className="text-xs text-muted-foreground">
                        {column.props.header}
                      </dt>
                      <dd className="break-words">{cellValue(column, row)}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {actions ? (
                <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-3">
                  {cellValue(actions, row)}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
        <footer className="text-center text-sm text-muted-foreground">
          {caption}
        </footer>
      </div>
      <div className="hidden rounded-lg border xl:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.props.header}
                  className={alignClass(column.props.align)}
                >
                  {column.props.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={keyOf(row, index)}>
                {columns.map((column) => (
                  <TableCell
                    key={column.props.header}
                    className={alignClass(column.props.align)}
                  >
                    {column.props.actions ? (
                      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
                        {cellValue(column, row)}
                      </div>
                    ) : (
                      cellValue(column, row)
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <caption className="mt-2 pb-2 text-sm text-muted-foreground">
            {caption}
          </caption>
        </Table>
      </div>
      {fetchNextPage ? (
        <InfiniteScrollFooter
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      ) : null}
    </div>
  )
}

export default DataList
