import { Link, useNavigate } from 'react-router-dom'
import ActionIconButton from '@/components/molecules/ActionIconButton'
import { Card, CardContent } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { recordCardView } from '@/utils/recordDisplay'

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
        const view = recordCardView(record, { showProfit, showPayment })
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
                        {view.name}
                      </Link>
                    ) : (
                      view.name
                    )}
                  </h2>
                  <p className="text-xs text-muted-foreground">{view.date}</p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {view.type}
                </Badge>
              </div>
              <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Cantidad</dt>
                  <dd>{view.quantity}</dd>
                </div>
                {view.profit ? (
                  <>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Precio compra
                      </dt>
                      <dd>{view.profit.purchase}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Precio venta
                      </dt>
                      <dd>{view.profit.sale}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Utilidad
                      </dt>
                      <dd className="font-semibold">{view.profit.amount}</dd>
                    </div>
                  </>
                ) : (
                  <div>
                    <dt className="text-xs text-muted-foreground">Precio</dt>
                    <dd>${view.price}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-muted-foreground">Total</dt>
                  <dd className="font-semibold">{view.total}</dd>
                </div>
                {view.payment != null && (
                  <div className="col-span-3">
                    <dt className="text-xs text-muted-foreground">
                      Tipo de pago
                    </dt>
                    <dd>{view.payment}</dd>
                  </div>
                )}
              </dl>
              {(detailsPath || onEdit || onDelete) && (
                <div className="flex items-center justify-end gap-2 border-t pt-3">
                  {detailsPath && (
                    <ActionIconButton
                      action="open"
                      label="Ver detalle"
                      onClick={() => navigate(`${detailsPath}/${record._id}`)}
                    />
                  )}
                  {onEdit && (
                    <ActionIconButton
                      action="edit"
                      label="Editar"
                      onClick={() => onEdit(record)}
                    />
                  )}
                  {onDelete && (
                    <ActionIconButton
                      action="delete"
                      label="Eliminar"
                      onClick={() => onDelete(record._id)}
                    />
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
