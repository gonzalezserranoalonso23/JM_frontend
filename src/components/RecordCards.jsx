import { Link, useNavigate } from 'react-router-dom'
import ActionIconButton from '@/components/ActionIconButton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/utils/dateDisplay'
import { formatMoney, formatQty } from '@/utils/commonFunctions'
import { isIssueRecord, movementPrices } from '@/utils/typeInventory'

const moneyOrDash = (value) => (value == null ? '-' : formatMoney(value))

const RecordCards = ({
  records,
  showPayment = false,
  showProfit = false,
  onEdit,
  onDelete,
  detailsPath
}) => {
  const navigate = useNavigate()

  return (
    <div className="space-y-3 xl:hidden">
      {records.map((record) => {
        const prices =
          showProfit && isIssueRecord(record) ? movementPrices(record) : null
        return (
          <Card as="article" key={record._id} className="gap-3 py-4">
            <CardContent className="space-y-3 px-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words font-medium">
                    {detailsPath ? (
                      <Link
                        to={`${detailsPath}/${record._id}`}
                        className="underline-offset-2 hover:underline"
                      >
                        {record.productName?.productName}
                      </Link>
                    ) : (
                      record.productName?.productName
                    )}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(record.date)}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {record.typeInventory?.typeInventory}
                </Badge>
              </div>
              <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Cantidad</dt>
                  <dd>{formatQty(record.quantity)}</dd>
                </div>
                {prices ? (
                  <>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Precio compra
                      </dt>
                      <dd>{moneyOrDash(prices.purchasePrice)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Precio venta
                      </dt>
                      <dd>{moneyOrDash(prices.productPrice)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Utilidad
                      </dt>
                      <dd className="font-semibold">
                        {moneyOrDash(prices.profit)}
                      </dd>
                    </div>
                  </>
                ) : (
                  <div>
                    <dt className="text-xs text-muted-foreground">Precio</dt>
                    <dd>${formatQty(record.productPrice)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-muted-foreground">Total</dt>
                  <dd className="font-semibold">
                    {formatMoney(record.totalAmount)}
                  </dd>
                </div>
                {showPayment && (
                  <div className="col-span-3">
                    <dt className="text-xs text-muted-foreground">
                      Tipo de pago
                    </dt>
                    <dd>{record.paymentType?.paymentType || '-'}</dd>
                  </div>
                )}
              </dl>
              {(detailsPath || (onEdit && onDelete)) && (
                <div className="flex items-center justify-end gap-2 border-t pt-3">
                  {detailsPath && (
                    <ActionIconButton
                      action="open"
                      label="Ver detalle"
                      onClick={() => navigate(`${detailsPath}/${record._id}`)}
                    />
                  )}
                  {onEdit && onDelete && (
                    <>
                      <ActionIconButton
                        action="edit"
                        label="Editar"
                        onClick={() => onEdit(record)}
                      />
                      <ActionIconButton
                        action="delete"
                        label="Eliminar"
                        onClick={() => onDelete(record._id)}
                      />
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default RecordCards
