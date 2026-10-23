import { todayLocal, isoDay } from '@/utils/dateDisplay'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ProductCombobox from '@/components/ui/product-combobox'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { useGetProducts } from '@/features/products.features'
import { useGetPaymentTypes } from '@/features/paymentTypes.features'
import Loading from '@/ui/Loading'
import {
  formatMoney,
  formatQty,
  calcLineTotal,
  confirmDiscardChanges
} from '@/utils/commonFunctions'
import { useCart } from '@/hooks/useCart'
import { useGetTypeInventories } from '@/features/typeInventory.features'

const getToday = () => todayLocal()

const getEmptyItem = () => ({
  productName: '',
  category: '',
  productPrice: '',
  quantity: '',
  totalAmount: ''
})

const getEmptyEditForm = () => ({
  date: getToday(),
  typeInventory: '',
  productName: '',
  category: '',
  productPrice: '',
  quantity: '',
  totalAmount: '',
  paymentType: ''
})

const ModalIssues = ({
  modalShow,
  handleClose,
  action,
  createBulkAction,
  record,
  isEditing
}) => {
  const { data: paymentTypes } = useGetPaymentTypes()
  const { issueType } = useGetTypeInventories()
  const {
    data: products,
    isLoading: loadingProducts,
    refetch: refetchProducts
  } = useGetProducts({ poll: Boolean(modalShow) })

  // Otra persona pudo mover el stock mientras la página estaba abierta
  useEffect(() => {
    if (modalShow) refetchProducts()
  }, [modalShow, refetchProducts])

  // Carrito: los productos se van sumando localmente, sin hacer una
  // petición POST por cada uno. Solo al "Registrar" se envían todos.
  const [date, setDate] = useState(getToday())
  const [itemForm, setItemForm] = useState(getEmptyItem())
  const { cart, addItem, removeItem, clearCart, total: cartTotal } = useCart()
  const [cartPaymentType, setCartPaymentType] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Estado exclusivo para editar un registro existente
  const [editFormData, setEditFormData] = useState(getEmptyEditForm())
  const [editSelectedProduct, setEditSelectedProduct] = useState(null)

  const applyDerivedFields = (values, name, value) => {
    let next = { ...values, [name]: value }

    if (name === 'productName') {
      const product = products?.find((p) => p._id === value)
      if (product) {
        next = {
          ...next,
          category: product.category._id,
          productPrice: product.productPrice
        }
      }
    }

    const totalAmount = calcLineTotal(next.quantity, next.productPrice)
    if (totalAmount !== '') next = { ...next, totalAmount }

    return next
  }

  // Stock disponible del producto restando lo ya agregado al carrito
  const getAvailableStock = (product, excludeTempId) => {
    if (!product) return 0
    const usedInCart = cart
      .filter(
        (item) =>
          item.productName === product._id && item.tempId !== excludeTempId
      )
      .reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0)
    return product.productStock - usedInCart
  }

  const setItemField = (name, value) => {
    setItemForm((prev) => applyDerivedFields(prev, name, value))
    setError('')
  }

  const handleItemChange = (e) => setItemField(e.target.name, e.target.value)

  const setEditField = (name, value) => {
    setEditFormData((prev) => applyDerivedFields(prev, name, value))
    setError('')

    if (name === 'productName') {
      const product = products?.find((p) => p._id === value)
      setEditSelectedProduct(product || null)
    }
  }

  const handleEditChange = (e) => setEditField(e.target.name, e.target.value)

  useEffect(() => {
    if (isEditing && record) {
      setEditFormData({
        date: record.date ? isoDay(record.date) : getToday(),
        typeInventory: record.typeInventory?._id || '',
        productName: record.productName?._id || record.productName || '',
        category: record.category?._id || record.category || '',
        productPrice: record.productPrice || '',
        quantity: record.quantity || '',
        totalAmount: record.totalAmount || '',
        paymentType: record.paymentType?._id || ''
      })
      const product = products?.find(
        (p) => p._id === (record.productName?._id || record.productName)
      )
      setEditSelectedProduct(product || null)
    }
  }, [record, isEditing, products])

  useEffect(() => {
    if (!modalShow) {
      setDate(getToday())
      setItemForm(getEmptyItem())
      clearCart()
      setCartPaymentType('')
      setEditFormData(getEmptyEditForm())
      setEditSelectedProduct(null)
      setError('')
    }
  }, [modalShow])

  const itemSelectedProduct = products?.find(
    (p) => p._id === itemForm.productName
  )

  const handleAddToCart = () => {
    if (!itemForm.productName || !itemForm.quantity) {
      setError('Selecciona un producto y una cantidad')
      return
    }

    const available = getAvailableStock(itemSelectedProduct)
    if (available < parseFloat(itemForm.quantity)) {
      setError(`Stock insuficiente. Disponible: ${formatQty(available)}`)
      return
    }

    addItem({
      ...itemForm,
      productLabel: itemSelectedProduct?.productName || ''
    })
    setItemForm(getEmptyItem())
    setError('')
  }

  const hasUnsavedCart =
    cart.length > 0 || Boolean(itemForm.productName || itemForm.quantity)

  const handleCancel = () => {
    if (hasUnsavedCart && !confirmDiscardChanges()) {
      return
    }
    handleClose()
  }

  const handleRemoveFromCart = removeItem

  const handleSubmitCart = async (e) => {
    e.preventDefault()

    if (cart.length === 0) {
      setError('Agrega al menos un producto al carrito')
      return
    }

    if (!issueType) {
      setError('No se pudo cargar el tipo de salida, intenta de nuevo')
      return
    }

    if (!cartPaymentType) {
      setError('Selecciona el tipo de pago para esta salida')
      return
    }

    // Revalida contra el stock actual: otra salida pudo vaciarlo mientras armabas el carrito
    setIsSubmitting(true)
    const { data: freshProducts } = await refetchProducts()
    const requested = cart.reduce((acc, item) => {
      acc[item.productName] =
        (acc[item.productName] || 0) + (parseFloat(item.quantity) || 0)
      return acc
    }, {})
    const short = Object.entries(requested)
      .map(([id, qty]) => ({
        product: freshProducts?.find((p) => p._id === id),
        qty
      }))
      .find(({ product, qty }) => !product || product.productStock < qty)

    if (short) {
      setIsSubmitting(false)
      setError(
        short.product
          ? `Stock insuficiente de ${short.product.productName}. Disponible: ${formatQty(short.product.productStock)}`
          : 'Un producto del carrito ya no existe'
      )
      return
    }

    if (
      !window.confirm(
        `¿Estás seguro que deseas registrar ${cart.length} salida(s)?`
      )
    ) {
      setIsSubmitting(false)
      return
    }

    const records = cart.map(({ tempId, productLabel, ...payload }) => ({
      ...payload,
      quantity: Number(payload.quantity),
      totalAmount: Number(payload.totalAmount),
      date,
      typeInventory: issueType.value,
      paymentType: cartPaymentType
    }))

    try {
      await createBulkAction.mutateAsync(records)
      clearCart()
      handleClose()
    } catch {
      // El carrito se conserva para que el usuario pueda reintentar
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitEdit = (e) => {
    e.preventDefault()

    if (
      !editFormData.typeInventory ||
      !editFormData.productName ||
      !editFormData.quantity
    ) {
      setError('Completa los campos requeridos')
      return
    }

    if (
      editSelectedProduct &&
      editSelectedProduct.productStock < parseFloat(editFormData.quantity)
    ) {
      setError(
        `Stock insuficiente. Disponible: ${formatQty(editSelectedProduct.productStock)}`
      )
      return
    }

    action.mutate(
      { id: record._id, body: editFormData },
      { onSuccess: () => handleClose() }
    )
  }

  if (isEditing) {
    return (
      <Dialog open={modalShow} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Salida</DialogTitle>
          </DialogHeader>
          <form
            autoComplete="off"
            onSubmit={handleSubmitEdit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <DialogBody>
              {loadingProducts && <Loading fullScreen={false} />}
              <div className="flex flex-col gap-4">
                {error && <Alert variant="destructive">{error}</Alert>}

                <div>
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    name="date"
                    value={editFormData.date}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="typeInventory">Tipo de Salida *</Label>
                  <Select value={editFormData.typeInventory} disabled>
                    <SelectTrigger id="typeInventory">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {issueType && (
                        <SelectItem value={issueType.value}>
                          {issueType.label}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="productName">Producto *</Label>
                  <ProductCombobox
                    id="productName"
                    products={products}
                    value={editFormData.productName}
                    onValueChange={(value) =>
                      setEditField('productName', value)
                    }
                    placeholder="Selecciona producto"
                    showStock
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Cantidad *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    name="quantity"
                    value={editFormData.quantity}
                    onChange={handleEditChange}
                    placeholder="0"
                    step="0.001"
                    min="0"
                    required
                  />
                  {editSelectedProduct && (
                    <small className="text-muted-foreground">
                      Stock disponible:{' '}
                      {formatQty(editSelectedProduct.productStock)}
                    </small>
                  )}
                </div>

                <div>
                  <Label htmlFor="productPrice">Precio de venta</Label>
                  <Input
                    id="productPrice"
                    type="number"
                    name="productPrice"
                    value={editFormData.productPrice}
                    disabled
                  />
                </div>

                <div>
                  <Label htmlFor="totalAmount">Total</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    value={editFormData.totalAmount}
                    disabled
                  />
                </div>

                <div>
                  <Label htmlFor="paymentTypeEdit">Tipo de pago</Label>
                  <Select
                    value={editFormData.paymentType}
                    onValueChange={(value) =>
                      setEditField('paymentType', value)
                    }
                  >
                    <SelectTrigger id="paymentTypeEdit">
                      <SelectValue placeholder="Selecciona un tipo de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit">Guardar cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={modalShow} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="sm:max-w-5xl"
        hasUnsavedChanges={hasUnsavedCart}
      >
        <DialogHeader>
          <DialogTitle>Nueva Salida</DialogTitle>
        </DialogHeader>
        <form
          autoComplete="off"
          onSubmit={handleSubmitCart}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <DialogBody>
            {loadingProducts && <Loading fullScreen={false} />}
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
              {error && (
                <Alert variant="destructive" className="lg:col-span-2">
                  {error}
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-4 rounded-lg border border-dashed border-border p-4 sm:grid-cols-2 lg:items-start">
                <div className="sm:col-span-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    name="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="productName">Producto</Label>
                  <ProductCombobox
                    id="productName"
                    products={products}
                    value={itemForm.productName}
                    onValueChange={(value) =>
                      setItemField('productName', value)
                    }
                    placeholder="Selecciona producto"
                    showStock
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    name="quantity"
                    value={itemForm.quantity}
                    onChange={handleItemChange}
                    placeholder="0"
                    step="0.001"
                    min="0"
                  />
                  {itemSelectedProduct && (
                    <small className="text-muted-foreground">
                      Stock disponible: {getAvailableStock(itemSelectedProduct)}
                    </small>
                  )}
                </div>

                <div>
                  <Label htmlFor="productPrice">Precio de venta</Label>
                  <Input
                    id="productPrice"
                    type="number"
                    name="productPrice"
                    value={itemForm.productPrice}
                    disabled
                  />
                </div>

                <div>
                  <Label htmlFor="totalAmount">Total</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    value={itemForm.totalAmount}
                    disabled
                  />
                </div>

                <Button
                  type="button"
                  className="sm:col-span-2 lg:col-span-1 lg:self-end"
                  onClick={handleAddToCart}
                >
                  + Agregar al carrito
                </Button>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 lg:self-stretch">
                <Label>Carrito ({cart.length})</Label>
                {cart.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center py-10 text-center text-sm text-muted-foreground">
                    Aún no hay productos en el carrito
                  </div>
                ) : (
                  <>
                    <ul className="space-y-2 lg:hidden">
                      {cart.map((item) => (
                        <li
                          key={item.tempId}
                          className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3"
                        >
                          <div className="min-w-0">
                            <p className="break-words text-sm font-medium">
                              {item.productLabel}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Cant. {item.quantity} · $
                              {parseFloat(item.totalAmount || 0).toFixed(2)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item.tempId)}
                            title="Quitar"
                          >
                            ✕
                          </Button>
                        </li>
                      ))}
                    </ul>
                    <div className="hidden max-h-72 overflow-y-auto overscroll-contain rounded-lg border lg:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-center">Cant.</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cart.map((item) => (
                            <TableRow key={item.tempId}>
                              <TableCell>{item.productLabel}</TableCell>
                              <TableCell className="text-center">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatMoney(item.totalAmount)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveFromCart(item.tempId)
                                  }
                                  title="Quitar"
                                >
                                  ✕
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="px-2 py-1 text-right text-sm">
                      Total: <strong>{formatMoney(cartTotal)}</strong>
                    </div>
                    <div>
                      <Label htmlFor="cartPaymentType">
                        Tipo de pago de la salida *
                      </Label>
                      <Select
                        value={cartPaymentType}
                        onValueChange={(value) => {
                          setCartPaymentType(value)
                          setError('')
                        }}
                      >
                        <SelectTrigger id="cartPaymentType">
                          <SelectValue placeholder="Selecciona un tipo de pago" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={cart.length === 0 || isSubmitting}>
              {isSubmitting
                ? 'Registrando...'
                : `Registrar ${cart.length || ''} salida${
                    cart.length === 1 ? '' : 's'
                  }`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalIssues
