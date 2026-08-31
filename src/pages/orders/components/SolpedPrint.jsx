import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from 'flowbite-react'
import './SolpedPrint.css'

const SolpedPrint = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print()
  }

  const getTotalAmount = () => {
    return (
      order.items?.reduce(
        (sum, item) => sum + (item.subtotal || item.quantity * item.price),
        0
      ) || 0
    )
  }

  const solpedNumber = order._id.slice(-6).toUpperCase()
  const formattedDate = new Date(order.date).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  return (
    <Modal show onClose={onClose} size="4xl">
      <ModalHeader>Solicitud de Pedido - #{solpedNumber}</ModalHeader>
      <ModalBody className="p-0 bg-white">
        <div className="solped-container">
          <div className="solped-document">
            {/* Header */}
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

            {/* Proveedor */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="solped-section">
                <h6 className="solped-label">PROVEEDOR</h6>
                <p className="solped-value">
                  <strong>{order.supplier?.name || 'N/A'}</strong>
                </p>
                {order.supplier?.contactInfo && (
                  <small className="text-gray-500">
                    {order.supplier.contactInfo}
                  </small>
                )}
              </div>
              <div className="solped-section">
                <h6 className="solped-label">ESTADO</h6>
                <p className="solped-value">
                  <span
                    className={`badge-minimal ${
                      order.status === 'completado'
                        ? 'badge-success'
                        : order.status === 'pendiente'
                          ? 'badge-warning'
                          : 'badge-info'
                    }`}
                  >
                    {order.status || 'pendiente'}
                  </span>
                </p>
              </div>
            </div>

            <hr className="solped-divider" />

            {/* Tabla de Productos */}
            <div className="solped-items">
              <h6 className="solped-label mb-3">PRODUCTOS SOLICITADOS</h6>
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
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.productName}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">
                        ${parseFloat(item.price).toFixed(2)}
                      </td>
                      <td className="text-right">
                        $
                        {(item.subtotal || item.quantity * item.price).toFixed(
                          2
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <hr className="solped-divider" />

            {/* Total */}
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

            {/* Notas */}
            <div className="solped-footer">
              <p className="text-center text-gray-400 text-sm mt-4">
                Esta es una solicitud de pedido generada automáticamente por el
                sistema de inventario.
              </p>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="no-print">
        <Button color="gray" onClick={onClose}>
          Cerrar
        </Button>
        <Button color="blue" onClick={handlePrint}>
          🖨️ Imprimir
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default SolpedPrint
