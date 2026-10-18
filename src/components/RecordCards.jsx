import ActionIconButton from '@/components/ActionIconButton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/utils/dateDisplay'

const money = (value) => `$${parseFloat(value).toFixed(2)}`

const RecordCards = ({ records, showPayment = false, onEdit, onDelete }) => (
  <div className="space-y-3 lg:hidden">
    {records.map((record) => (
      <Card key={record._id} className="gap-3 py-4">
        <CardContent className="space-y-3 px-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="break-words font-medium">
                {record.productName?.productName}
              </p>
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
              <dd>{record.quantity}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Precio</dt>
              <dd>{money(record.productPrice)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Total</dt>
              <dd className="font-semibold">{money(record.totalAmount)}</dd>
            </div>
            {showPayment && (
              <div className="col-span-3">
                <dt className="text-xs text-muted-foreground">Tipo de pago</dt>
                <dd>{record.paymentType?.paymentType || '-'}</dd>
              </div>
            )}
          </dl>
          {onEdit && onDelete && (
            <div className="flex items-center justify-end gap-2 border-t pt-3">
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
            </div>
          )}
        </CardContent>
      </Card>
    ))}
  </div>
)

export default RecordCards
