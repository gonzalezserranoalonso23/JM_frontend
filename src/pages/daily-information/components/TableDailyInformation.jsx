import ActionIconButton from '@/components/ActionIconButton'
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
  <div className="rounded-lg border">
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
)

export default TableDailyInformation
