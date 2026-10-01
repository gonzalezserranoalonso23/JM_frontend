import { useState } from 'react'
import {
  useGetOrderRequests,
  useDeleteOrderRequest,
  useCreateOrderRequest,
  useUpdateOrderRequest
} from '@/features/orders.features'
import ModalOrderRequest from './ModalOrderRequest'
import SolpedPrint from './SolpedPrint'
import Loading from '@/ui/Loading'
import '../../../styles/inventory.css'

const SectionOrders = () => {
  const { data: orders, isLoading, isError } = useGetOrderRequests()
  const createOrder = useCreateOrderRequest()
  const deleteOrder = useDeleteOrderRequest()
  const updateOrder = useUpdateOrderRequest()

  const [modalShow, setModalShow] = useState(false)
  const [showSolped, setShowSolped] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [editingOrder, setEditingOrder] = useState(null)

  const handleClose = () => {
    setModalShow(false)
    setEditingOrder(null)
  }
  const handleShow = () => {
    setEditingOrder(null)
    setModalShow(true)
  }

  const handleEdit = (order) => {
    setEditingOrder(order)
    setModalShow(true)
  }

  const handleStatusChange = (order) => {
    const status = order.status === 'confirmado' ? 'pendiente' : 'confirmado'
    updateOrder.mutate({ id: order._id, body: { status } })
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar esta solicitud?')) {
      deleteOrder.mutate(id)
    }
  }

  const handleViewSolped = (order) => {
    setSelectedOrder(order)
    setShowSolped(true)
  }

  const handleOrderUpdated = (updatedOrder) => {
    setSelectedOrder(updatedOrder)
  }

  if (isLoading) return <Loading />
  if (isError)
    return (
      <div
        className="alert-minimal alert-danger-minimal"
        style={{ margin: '2rem' }}
      >
        Error al cargar las solicitudes
      </div>
    )

  const getStatusColor = (status) => {
    if (status === 'confirmado') return 'badge-success'
    return 'badge-warning'
  }

  return (
    <div className="section-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <h4 className="section-title">Solicitudes de Pedido</h4>
          <p className="section-subtitle">Gestión de órdenes de compra</p>
        </div>
        <button className="btn-custom btn-primary-custom" onClick={handleShow}>
          + Nueva Solicitud
        </button>
      </div>

      {/* Modal */}
      <ModalOrderRequest
        modalShow={modalShow}
        handleClose={handleClose}
        action={editingOrder ? updateOrder : createOrder}
        order={editingOrder}
      />

      {/* Solped Print */}
      {showSolped && selectedOrder && (
        <SolpedPrint
          order={selectedOrder}
          onClose={() => setShowSolped(false)}
          updateOrder={updateOrder}
          onOrderUpdated={handleOrderUpdated}
          onEdit={() => {
            setShowSolped(false)
            handleEdit(selectedOrder)
          }}
        />
      )}

      {/* Tabla */}
      {orders && orders.length > 0 ? (
        <div className="table-wrapper">
          <table className="table-minimal">
            <thead>
              <tr>
                <th>Nº Solicitud</th>
                <th>Proveedor</th>
                <th style={{ textAlign: 'center' }}>Productos</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                  </td>
                  <td>
                    {order.supplier?.suppliersName ||
                      order.supplier?.name ||
                      'N/A'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {order.items?.length || 0}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong>${(order.totalAmount || 0).toFixed(2)}</strong>
                  </td>
                  <td>
                    <span
                      className={`badge-minimal ${getStatusColor(order.status)}`}
                    >
                      {order.status || 'pendiente'}
                    </span>
                  </td>
                  <td>
                    <small>{new Date(order.date).toLocaleDateString()}</small>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                      {order.status !== 'confirmado' && (
                        <button
                          className="btn-action btn-info-sm w-full sm:w-auto"
                          onClick={() => handleViewSolped(order)}
                          title="Abrir vista previa de la solicitud"
                        >
                          Abrir
                        </button>
                      )}
                      {order.status === 'confirmado' && (
                        <button
                          className="btn-action btn-info-sm w-full sm:w-auto"
                          onClick={() => handleStatusChange(order)}
                          disabled={updateOrder.isPending}
                          title="Reabrir solicitud"
                        >
                          Reabrir
                        </button>
                      )}
                      <button
                        className="btn-action btn-danger-sm w-full sm:w-auto"
                        onClick={() => handleDelete(order._id)}
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert-minimal alert-info-minimal">
          No hay solicitudes registradas
        </div>
      )}
    </div>
  )
}

export default SectionOrders
