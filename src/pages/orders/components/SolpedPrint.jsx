import { formatMoney } from '@/utils/commonFunctions'
import { formatDate } from '@/utils/dateDisplay'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import './SolpedPrint.css'

const ItemCards = ({ items }) => (
  <ul className="space-y-2 md:hidden print:hidden">
    {items.map((item, index) => (
      <li
        key={`${item.productId || item.productName}-${index}`}
        className="rounded-lg border border-[var(--sp-line)] bg-[var(--sp-card)] p-3"
      >
        <p className="break-words text-sm font-medium">{item.productName}</p>
        <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div>
            <dt className="text-[var(--sp-muted)]">Cantidad</dt>
            <dd>{item.quantity}</dd>
          </div>
          <div>
            <dt className="text-[var(--sp-muted)]">Precio</dt>
            <dd>{formatMoney(item.price)}</dd>
          </div>
          <div className="text-right">
            <dt className="text-[var(--sp-muted)]">Subtotal</dt>
            <dd className="font-semibold">
              {formatMoney(item.subtotal || item.quantity * item.price)}
            </dd>
          </div>
        </dl>
      </li>
    ))}
  </ul>
)

const ItemsTable = ({ items }) => (
  <table className="solped-table">
    <thead>
      <tr>
        <th style={{ width: '50%' }}>Producto</th>
        <th style={{ width: '15%' }} className="text-center">
          Cantidad
        </th>
        <th style={{ width: '15%' }} className="text-right">
          Precio Unit.
        </th>
        <th style={{ width: '20%' }} className="text-right">
          Subtotal
        </th>
      </tr>
    </thead>
    <tbody>
      {items.map((item, index) => (
        <tr key={`${item.productId || item.productName}-${index}`}>
          <td>{item.productName}</td>
          <td className="text-center">{item.quantity}</td>
          <td className="text-right">{formatMoney(item.price)}</td>
          <td className="text-right">
            {formatMoney(item.subtotal || item.quantity * item.price)}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

const SolpedPrint = ({
  order,
  onClose,
  updateOrder,
  onOrderUpdated,
  onEdit
}) => {
  const getTotalAmount = () => {
    return (
      order.items?.reduce(
        (sum, item) => sum + (item.subtotal || item.quantity * item.price),
        0
      ) || 0
    )
  }

  const handleStatusChange = (status) => {
    updateOrder.mutate(
      { id: order._id, body: { status } },
      {
        onSuccess: (updatedOrder) => {
          onOrderUpdated(updatedOrder)
          if (status === 'confirmado') onClose()
        }
      }
    )
  }

  const solpedNumber = order._id.slice(-6).toUpperCase()
  const currentStatus = order.status || 'pendiente'
  const formattedDate = formatDate(order.date, 'es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="solped-dialog sm:max-w-4xl">
        <DialogHeader className="no-print">
          <div>
            <DialogTitle>Solicitud de Pedido</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Vista previa · Nº {solpedNumber}
            </p>
          </div>
        </DialogHeader>
        <DialogBody className="solped-print-body p-0 max-sm:p-0">
          <div className="solped-container">
            <div className="solped-document">
              <div className="solped-header">
                <div className="solped-title">
                  <h2>SOLICITUD DE PEDIDO</h2>
                  <p className="solped-number">Nº {solpedNumber}</p>
                </div>
                <div className="solped-date">
                  <p>
                    <strong>Fecha:</strong> {formattedDate}
                  </p>
                </div>
              </div>

              <hr className="solped-divider" />

              <div className="solped-meta-grid grid grid-cols-2 gap-4 mb-4">
                <div className="solped-section">
                  <h6 className="solped-label">PROVEEDOR</h6>
                  <p className="solped-value">
                    <strong>
                      {order.supplier?.suppliersName ||
                        order.supplier?.name ||
                        'N/A'}
                    </strong>
                  </p>
                  {(order.supplier?.suppliersContact ||
                    order.supplier?.contactInfo) && (
                    <small className="text-[var(--sp-muted)]">
                      {order.supplier.suppliersContact ||
                        order.supplier.contactInfo}
                    </small>
                  )}
                </div>
                <div className="solped-section">
                  <h6 className="solped-label">ESTADO</h6>
                  <p className="solped-value">
                    <Badge
                      variant="outline"
                      className={
                        currentStatus === 'confirmado'
                          ? 'text-emerald-500 print:text-emerald-700'
                          : 'text-amber-500 print:text-amber-700'
                      }
                    >
                      {currentStatus}
                    </Badge>
                  </p>
                </div>
              </div>

              <hr className="solped-divider" />

              <div className="solped-items">
                <h6 className="solped-label mb-3">PRODUCTOS SOLICITADOS</h6>
                <ItemCards items={order.items || []} />
                <div className="solped-table-wrap hidden md:block print:block">
                  <ItemsTable items={order.items || []} />
                </div>
              </div>

              <hr className="solped-divider" />

              <div className="flex justify-end mb-4">
                <div className="solped-total">
                  <div className="flex justify-between gap-8 mb-2">
                    <small className="text-[var(--sp-muted)]">SUBTOTAL:</small>
                    <small>{formatMoney(getTotalAmount())}</small>
                  </div>
                  <div className="solped-total-amount">
                    <div className="flex justify-between gap-8">
                      <strong>TOTAL:</strong>
                      <strong className="solped-amount">
                        {formatMoney(getTotalAmount())}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="solped-footer">
                <p className="text-center text-[var(--sp-muted)] text-sm mt-4">
                  Esta es una solicitud de pedido generada automáticamente por
                  el sistema de inventario.
                </p>
              </footer>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="no-print max-md:grid max-md:grid-cols-2">
          <Button variant="outline" onClick={onEdit}>
            Editar
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            variant={currentStatus === 'pendiente' ? 'default' : 'outline'}
            className="disabled:opacity-100"
            onClick={() => handleStatusChange('pendiente')}
            disabled={currentStatus === 'pendiente' || updateOrder.isPending}
            title="Cambiar el estado a pendiente"
          >
            Pendiente
          </Button>
          <Button
            variant={currentStatus === 'confirmado' ? 'default' : 'outline'}
            className="disabled:opacity-100"
            onClick={() => handleStatusChange('confirmado')}
            disabled={currentStatus === 'confirmado' || updateOrder.isPending}
            title="Cambiar el estado a confirmado"
          >
            Confirmado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SolpedPrint
