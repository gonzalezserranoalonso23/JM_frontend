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
import './SolpedPrint.css'

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
          <td className="text-right">${Number(item.price).toFixed(2)}</td>
          <td className="text-right">
            ${(item.subtotal || item.quantity * item.price).toFixed(2)}
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
      { onSuccess: onOrderUpdated }
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
      <DialogContent className="solped-dialog max-w-4xl p-0">
        <DialogHeader className="solped-modal-heading no-print">
          <div>
            <DialogTitle className="solped-modal-title">
              Solicitud de Pedido
            </DialogTitle>
            <p className="solped-modal-subtitle">
              Vista previa · Nº {solpedNumber}
            </p>
          </div>
        </DialogHeader>
        <DialogBody className="solped-print-body min-h-0 bg-white p-0">
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
                    <small className="text-gray-500">
                      {order.supplier.suppliersContact ||
                        order.supplier.contactInfo}
                    </small>
                  )}
                </div>
                <div className="solped-section">
                  <h6 className="solped-label">ESTADO</h6>
                  <p className="solped-value">
                    <span
                      className={`badge-minimal ${
                        currentStatus === 'confirmado'
                          ? 'badge-success'
                          : 'badge-warning'
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </p>
                </div>
              </div>

              <hr className="solped-divider" />

              <div className="solped-items">
                <h6 className="solped-label mb-3">PRODUCTOS SOLICITADOS</h6>
                <div className="solped-table-wrap">
                  <ItemsTable items={order.items || []} />
                </div>
              </div>

              <hr className="solped-divider" />

              <div className="flex justify-end mb-4">
                <div className="solped-total">
                  <div className="flex justify-between gap-8 mb-2">
                    <small className="text-gray-500">SUBTOTAL:</small>
                    <small>${getTotalAmount().toFixed(2)}</small>
                  </div>
                  <div className="solped-total-amount">
                    <div className="flex justify-between gap-8">
                      <strong>TOTAL:</strong>
                      <strong className="solped-amount">
                        ${getTotalAmount().toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="solped-footer">
                <p className="text-center text-gray-400 text-sm mt-4">
                  Esta es una solicitud de pedido generada automáticamente por
                  el sistema de inventario.
                </p>
              </footer>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="solped-modal-footer no-print">
          <Button
            variant="outline"
            className="solped-footer-button"
            onClick={onEdit}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            className="solped-footer-button"
            onClick={onClose}
          >
            Cerrar
          </Button>
          <Button
            variant={currentStatus === 'pendiente' ? 'default' : 'outline'}
            className={
              currentStatus === 'pendiente'
                ? 'solped-footer-button-primary disabled:opacity-100'
                : 'solped-footer-button'
            }
            onClick={() => handleStatusChange('pendiente')}
            disabled={currentStatus === 'pendiente' || updateOrder.isPending}
            title="Cambiar el estado a pendiente"
          >
            Pendiente
          </Button>
          <Button
            variant={currentStatus === 'confirmado' ? 'default' : 'outline'}
            className={
              currentStatus === 'confirmado'
                ? 'solped-footer-button-primary disabled:opacity-100'
                : 'solped-footer-button'
            }
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
