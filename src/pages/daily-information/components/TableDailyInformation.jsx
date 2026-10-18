import ActionIconButton from '@/components/ActionIconButton'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'

const formatAmount = (amount) =>
  Number(amount || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN'
  })

const TableDailyInformation = ({ records, handleUpdate, handleDelete }) => (
  <>
    <div className="space-y-3 lg:hidden">
      {records.map((record) => (
        <Card key={record._id} className="gap-3 py-4">
          <CardContent className="space-y-3 px-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium">{record.date}</p>
              <p className="text-xs text-muted-foreground">
                {record.totalTransactions} transacciones
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Efectivo</dt>
                <dd>{formatAmount(record.cashSales)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Tarjeta</dt>
                <dd>{formatAmount(record.cardSales)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Total</dt>
                <dd className="font-semibold">
                  {formatAmount(record.totalSales)}
                </dd>
              </div>
            </dl>
            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <ActionIconButton
                action="edit"
                label="Editar"
                onClick={() => handleUpdate(record)}
              />
              <ActionIconButton
                action="delete"
                label="Eliminar"
                onClick={() => handleDelete(record._id)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
      <p className="text-center text-sm text-muted-foreground">
        Total: {records.length} registros
      </p>
    </div>
    <div className="hidden rounded-lg border lg:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Efectivo</TableHead>
            <TableHead className="text-right">Tarjeta</TableHead>
            <TableHead className="text-right">Ventas totales</TableHead>
            <TableHead className="text-center">Transacciones</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record._id}>
              <TableCell>{record.date}</TableCell>
              <TableCell className="text-right">
                {formatAmount(record.cashSales)}
              </TableCell>
              <TableCell className="text-right">
                {formatAmount(record.cardSales)}
              </TableCell>
              <TableCell className="text-right">
                {formatAmount(record.totalSales)}
              </TableCell>
              <TableCell className="text-center">
                {record.totalTransactions}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
                  <ActionIconButton
                    action="edit"
                    label="Editar"
                    onClick={() => handleUpdate(record)}
                  />
                  <ActionIconButton
                    action="delete"
                    label="Eliminar"
                    onClick={() => handleDelete(record._id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <caption className="mt-2 mb-2 text-sm text-muted-foreground">
          Total: {records.length} registros
        </caption>
      </Table>
    </div>
  </>
)

export default TableDailyInformation
