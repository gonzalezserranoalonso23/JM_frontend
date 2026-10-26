import InfiniteScrollFooter from '@/components/InfiniteScrollFooter'
import RecordCards from '@/components/RecordCards'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'
import { formatMoney, formatQty } from '@/utils/commonFunctions'
import { formatDate } from '@/utils/dateDisplay'
import { isExitType, isIssueRecord, movementPrices } from '@/utils/typeInventory'

const moneyOrDash = (value) => (value == null ? '-' : formatMoney(value))

const ReportsMovementsTable = ({
  records,
  showProfit = false,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage
}) => {
  const columnCount = showProfit ? 9 : 7
  return (
    <>
      {records.length > 0 ? (
        <RecordCards records={records} showPayment showProfit={showProfit} />
      ) : (
        <p className="rounded-lg border p-8 text-center text-muted-foreground lg:hidden">
          No hay movimientos en este período
        </p>
      )}
      <div className="hidden rounded-lg border lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Forma de pago</TableHead>
              <TableHead className="text-center">Cantidad</TableHead>
              {showProfit ? (
                <>
                  <TableHead className="text-right">Precio compra</TableHead>
                  <TableHead className="text-right">Precio venta</TableHead>
                  <TableHead className="text-right">Utilidad</TableHead>
                </>
              ) : (
                <TableHead className="text-right">Precio Unit.</TableHead>
              )}
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length > 0 ? (
              records.map((record) => {
                const prices = showProfit ? movementPrices(record) : null
                const showRowProfit = showProfit && isIssueRecord(record)
                return (
                  <TableRow key={record._id}>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>
                      <strong>{record.productName?.productName}</strong>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          isExitType(record.typeInventory)
                            ? 'destructive'
                            : 'outline'
                        }
                        className={
                          isExitType(record.typeInventory)
                            ? undefined
                            : 'text-emerald-400'
                        }
                      >
                        {record.typeInventory?.typeInventory}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.paymentType?.paymentType || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatQty(record.quantity)}
                    </TableCell>
                    {showProfit ? (
                      showRowProfit ? (
                        <>
                          <TableCell className="text-right">
                            {moneyOrDash(prices.purchasePrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            {moneyOrDash(prices.productPrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            {moneyOrDash(prices.profit)}
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-right">-</TableCell>
                          <TableCell className="text-right">-</TableCell>
                          <TableCell className="text-right">-</TableCell>
                        </>
                      )
                    ) : (
                      <TableCell className="text-right">
                        ${formatQty(record.productPrice)}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <strong>{formatMoney(record.totalAmount)}</strong>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="p-8 text-center text-muted-foreground"
                >
                  No hay movimientos en este período
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="rounded-b-lg">
        <InfiniteScrollFooter
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      </div>
    </>
  )
}

export default ReportsMovementsTable
