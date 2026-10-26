import { formatMoney } from '@/utils/commonFunctions'
import { formatDate } from '@/utils/dateDisplay'
import { useState } from 'react'
import {
  useGetOrderRequests,
  useDeleteOrderRequest,
  useCreateOrderRequest,
  useUpdateOrderRequest
} from '@/features/orders.features'
import ModalOrderRequest from './ModalOrderRequest'
import SolpedPrint from './SolpedPrint'
import ListSkeleton from '@/components/ListSkeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'
import ActionIconButton from '@/components/ActionIconButton'
import FormFilter from '@/components/FormFilter'
import useFilterQuery from '@/hooks/useFilterQuery'
import { buildMatcher, dateCells, matchesCells } from '@/utils/filterMatcher'

const SectionOrders = () => {
  const { data: orders, isLoading, isError } = useGetOrderRequests()
  const createOrder = useCreateOrderRequest()
  const deleteOrder = useDeleteOrderRequest()
  const updateOrder = useUpdateOrderRequest()

  const [filter, setFilter] = useFilterQuery()
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

  // El backend ya entrega pendientes primero y la fecha más reciente arriba
  const matcher = buildMatcher(filter)
  const sortedOrders = (orders || []).filter((order) =>
    matchesCells(
      [
        order.supplier?.suppliersName || order.supplier?.name,
        ...dateCells(order.date)
      ],
      matcher
    )
  )

  const getStatusColor = (status) =>
    status === 'confirmado' ? 'text-emerald-400' : 'text-amber-400'

  return (
    <Card as="section" aria-labelledby="orders-title">
      {/* Header */}
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 id="orders-title" className="text-2xl font-semibold">
            Solicitudes de Pedido
          </h1>
          <CardDescription>Gestión de órdenes de compra</CardDescription>
        </div>
        <Button onClick={handleShow}>+ Nueva Solicitud</Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
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

        <FormFilter
          id="order-filter"
          label="Buscar solicitud"
          value={filter}
          onChange={setFilter}
        />

        {/* Tabla */}
        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <Alert variant="destructive">
            <AlertDescription>Error al cargar las solicitudes</AlertDescription>
          </Alert>
        ) : sortedOrders.length > 0 ? (
          <>
            <div className="space-y-3 xl:hidden">
              {sortedOrders.map((order) => (
                <Card as="article" key={order._id} className="gap-3 py-4">
                  <CardContent className="space-y-3 px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-medium">
                          #{order._id.slice(-6).toUpperCase()}
                        </h2>
                        <p className="break-words text-xs text-muted-foreground">
                          {order.supplier?.suppliersName ||
                            order.supplier?.name ||
                            'N/A'}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 ${getStatusColor(order.status)}`}
                      >
                        {order.status || 'pendiente'}
                      </Badge>
                    </div>
                    <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">Fecha</dt>
                        <dd>{formatDate(order.date)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Productos
                        </dt>
                        <dd>{order.items?.length || 0}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Total</dt>
                        <dd className="font-semibold">
                          {formatMoney(order.totalAmount || 0)}
                        </dd>
                      </div>
                    </dl>
                    <div className="flex items-center justify-end gap-2 border-t pt-3">
                      {order.status !== 'confirmado' && (
                        <ActionIconButton
                          action="open"
                          label="Abrir"
                          onClick={() => handleViewSolped(order)}
                        />
                      )}
                      {order.status === 'confirmado' && (
                        <ActionIconButton
                          action="reopen"
                          label="Reabrir"
                          onClick={() => handleStatusChange(order)}
                          disabled={updateOrder.isPending}
                        />
                      )}
                      <ActionIconButton
                        action="delete"
                        label="Eliminar"
                        onClick={() => handleDelete(order._id)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="hidden rounded-lg border xl:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Solicitud</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead className="text-center">Productos</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                      </TableCell>
                      <TableCell>
                        {order.supplier?.suppliersName ||
                          order.supplier?.name ||
                          'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        {order.items?.length || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <strong>{formatMoney(order.totalAmount || 0)}</strong>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(order.status)}
                        >
                          {order.status || 'pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <small>{formatDate(order.date)}</small>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                          {order.status !== 'confirmado' && (
                            <ActionIconButton
                              action="open"
                              label="Abrir"
                              onClick={() => handleViewSolped(order)}
                            />
                          )}
                          {order.status === 'confirmado' && (
                            <ActionIconButton
                              action="reopen"
                              label="Reabrir"
                              onClick={() => handleStatusChange(order)}
                              disabled={updateOrder.isPending}
                            />
                          )}
                          <ActionIconButton
                            action="delete"
                            label="Eliminar"
                            onClick={() => handleDelete(order._id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <Alert>
            <AlertDescription>No hay solicitudes registradas</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default SectionOrders
