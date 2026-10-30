import { todayLocal, isoDay } from '@/utils/dateDisplay'
import { useEffect, useRef, useState } from 'react'
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
import { useProductLookup } from '@/features/products.features'
import { useGetPaymentTypes } from '@/features/paymentTypes.features'
import { getProduct } from '@/services/products.services'
import Loading from '@/ui/Loading'
import {
  formatMoney,
  formatQty,
  informativeStock,
  roundTo,
  calcLineTotal,
  confirmDiscardChanges
} from '@/utils/commonFunctions'
import { useCart } from '@/hooks/useCart'
import { errorMessage } from '@/libs/handleErrors'
import { useGetTypeInventories } from '@/features/typeInventory.features'
import useDebouncedValue from '@/hooks/useDebouncedValue'

const COPY = {
  entry: {
    title: 'Entrada',
    noun: 'entrada',
    priceLabel: 'Precio de compra',
    priceKey: 'purchasePrice',
    checkStock: false
  },
  issue: {
    title: 'Salida',
    noun: 'salida',
    priceLabel: 'Precio de venta',
    priceKey: 'productPrice',
    checkStock: true
  }
}

const getToday = () => todayLocal()

const getEmptyItem = () => ({
  productName: '',
  category: '',
  productPrice: '',
  quantity: '',
  totalAmount: ''
})

const getEmptyEditForm = (withPayment) => ({
  date: getToday(),
  typeInventory: '',
  productName: '',
  category: '',
  productPrice: '',
  quantity: '',
  totalAmount: '',
  ...(withPayment ? { paymentType: '' } : {})
})

const MovementModal = ({
  mode,
  modalShow,
  handleClose,
  action,
  createBulkAction,
  record,
  isEditing
}) => {
  const copy = COPY[mode]
  const withPayment = mode === 'issue'
  const { data: paymentTypes = [] } = useGetPaymentTypes()
  const types = useGetTypeInventories()
  const movementType = mode === 'issue' ? types.issueType : types.entryType
  const [productQuery, setProductQuery] = useState('')
  const debouncedQuery = useDebouncedValue(productQuery, 250)
  const { data: productPage, isLoading: loadingProducts } = useProductLookup(
    debouncedQuery,
    Boolean(modalShow)
  )
  const knownProducts = useRef(new Map())
  const rememberProduct = (product) => {
    if (product?._id) knownProducts.current.set(product._id, product)
  }

  const [date, setDate] = useState(getToday())
  const [itemForm, setItemForm] = useState(getEmptyItem())
  const { cart, addItem, removeItem, clearCart, total: cartTotal } = useCart()
  const [cartPaymentType, setCartPaymentType] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editFormData, setEditFormData] = useState(
    getEmptyEditForm(withPayment)
  )
  const [editSelectedProduct, setEditSelectedProduct] = useState(null)

  useEffect(() => {
    ;(productPage?.data ?? []).forEach(rememberProduct)
  }, [productPage])

  const pageProducts = productPage?.data ?? []

  const findProduct = (id) =>
    pageProducts.find((product) => String(product._id) === String(id)) ||
    knownProducts.current.get(id) ||
    knownProducts.current.get(String(id))

  const withSelection = (products, selectedId) => {
    const selected = findProduct(selectedId)
    if (
      !selected ||
      products.some((product) => String(product._id) === String(selected._id))
    ) {
      return products
    }
    return [selected, ...products]
  }

  const applyDerivedFields = (values, name, value) => {
    let next = { ...values, [name]: value }

    if (name === 'productName') {
      const product = findProduct(value)
      if (product) {
        rememberProduct(product)
        next = {
          ...next,
          category: product.category?._id || product.category,
          productPrice: product[copy.priceKey]
        }
      }
    }

    const totalAmount = calcLineTotal(next.quantity, next.productPrice)
    if (totalAmount !== '') next = { ...next, totalAmount }

    return next
  }

  const cartQty = (productId) =>
    cart
      .filter((item) => String(item.productName) === String(productId))
      .reduce(
        (sum, item) => roundTo(sum + (parseFloat(item.quantity) || 0), 3),
        0
      )

  const stockFigures = (productId, fallbackStock) => {
    const product = findProduct(productId)
    const saved = cart.find(
      (item) => String(item.productName) === String(productId)
    )?.originalStock
    const original =
      product?.productStock ?? saved ?? fallbackStock ?? 0
    return informativeStock(original, cartQty(productId))
  }

  const setItemField = (name, value) => {
    setItemForm((prev) => applyDerivedFields(prev, name, value))
    setError('')
  }

  const handleItemChange = (event) =>
    setItemField(event.target.name, event.target.value)

  const setEditField = (name, value) => {
    setEditFormData((prev) => applyDerivedFields(prev, name, value))
    setError('')
    if (name === 'productName')
      setEditSelectedProduct(findProduct(value) || null)
  }

  const handleEditChange = (event) =>
    setEditField(event.target.name, event.target.value)

  useEffect(() => {
    if (!isEditing || !record) return
    const populated = record.productName
    if (populated && typeof populated === 'object') rememberProduct(populated)
    setEditFormData({
      date: record.date ? isoDay(record.date) : getToday(),
      typeInventory: record.typeInventory?._id || '',
      productName: populated?._id || populated || '',
      category: record.category?._id || record.category || '',
      productPrice: record.productPrice || '',
      quantity: record.quantity || '',
      totalAmount: record.totalAmount || '',
      ...(withPayment ? { paymentType: record.paymentType?._id || '' } : {})
    })
    setEditSelectedProduct(
      findProduct(populated?._id || populated) ||
        (populated && typeof populated === 'object' ? populated : null)
    )
  }, [record, isEditing])

  useEffect(() => {
    if (modalShow) return
    setDate(getToday())
    setItemForm(getEmptyItem())
    clearCart()
    setCartPaymentType('')
    setEditFormData(getEmptyEditForm(withPayment))
    setEditSelectedProduct(null)
    setProductQuery('')
    setError('')
  }, [modalShow])

  const itemSelectedProduct = findProduct(itemForm.productName)
  const selectedFigures = itemSelectedProduct
    ? stockFigures(itemSelectedProduct._id, itemSelectedProduct.productStock)
    : null
  const stockText = (product) => {
    const figures = stockFigures(product._id, product.productStock)
    return `Stock: ${formatQty(figures.original)} · Disponible: ${formatQty(figures.available)}`
  }

  const handleAddToCart = () => {
    if (!itemForm.productName || !itemForm.quantity) {
      setError('Selecciona un producto y una cantidad')
      return
    }

    if (copy.checkStock) {
      const figures = stockFigures(
        itemForm.productName,
        itemSelectedProduct?.productStock
      )
      if (figures.available < roundTo(itemForm.quantity, 3)) {
        setError(
          `Stock insuficiente. Disponible: ${formatQty(figures.available)}`
        )
        return
      }
    }

    addItem({
      ...itemForm,
      productLabel: itemSelectedProduct?.productName || '',
      originalStock: roundTo(itemSelectedProduct?.productStock, 3)
    })
    setItemForm(getEmptyItem())
    setError('')
  }

  const hasUnsavedCart =
    cart.length > 0 || Boolean(itemForm.productName || itemForm.quantity)

  const handleCancel = () => {
    if (hasUnsavedCart && !confirmDiscardChanges()) return
    handleClose()
  }

  const handleCartFormSubmit = (event) => {
    event.preventDefault()
    if (event.nativeEvent.submitter?.name === 'register') {
      handleSubmitCart(event)
      return
    }
    handleAddToCart()
  }

  const handleSubmitCart = async (event) => {
    event.preventDefault()

    if (cart.length === 0) {
      setError('Agrega al menos un producto al carrito')
      return
    }

    if (!movementType) {
      setError(`No se pudo cargar el tipo de ${copy.noun}, intenta de nuevo`)
      return
    }

    if (withPayment && !cartPaymentType) {
      setError('Selecciona el tipo de pago para esta salida')
      return
    }

    setIsSubmitting(true)

    const plural = cart.length === 1 ? copy.noun : `${copy.noun}s`
    if (
      !window.confirm(
        `¿Estás seguro que deseas registrar ${cart.length} ${plural}?`
      )
    ) {
      setIsSubmitting(false)
      return
    }

    // El aviso de al agregar no reserva el stock. Se vuelve a leer justo
    // antes de enviar, porque otra salida pudo haberlo tomado mientras tanto.
    if (copy.checkStock) {
      const ids = [...new Set(cart.map((item) => item.productName))]
      const freshProducts = await Promise.all(
        ids.map((id) => getProduct(id).catch(() => null))
      )
      freshProducts.forEach(rememberProduct)
      const requested = cart.reduce((acc, item) => {
        acc[item.productName] = roundTo(
          (acc[item.productName] || 0) + (parseFloat(item.quantity) || 0),
          3
        )
        return acc
      }, {})
      const short = Object.entries(requested)
        .map(([id, qty]) => ({
          product: freshProducts.find(
            (product) => String(product?._id) === String(id)
          ),
          qty
        }))
        .find(
          ({ product, qty }) =>
            !product || roundTo(product.productStock, 3) < qty
        )

      if (short) {
        setIsSubmitting(false)
        setError(
          short.product
            ? `Stock insuficiente de ${short.product.productName}. Disponible: ${formatQty(short.product.productStock)}`
            : 'Un producto del carrito ya no existe'
        )
        return
      }
    }

    const records = cart.map(({ tempId, productLabel, ...payload }) => ({
      ...payload,
      quantity: Number(payload.quantity),
      totalAmount: Number(payload.totalAmount),
      date,
      typeInventory: movementType.value,
      ...(withPayment ? { paymentType: cartPaymentType } : {})
    }))

    try {
      await createBulkAction.mutateAsync(records)
      clearCart()
      handleClose()
    } catch (error) {
      // El carrito se conserva para que el usuario pueda reintentar
      const message = errorMessage(error)
      if (message) setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Esta salida ya descontó su cantidad. Al editarla, ese stock sigue disponible.
  const editHeldQty =
    copy.checkStock &&
    record &&
    String(record.productName?._id || record.productName) ===
      String(editFormData.productName)
      ? roundTo(record.quantity, 3)
      : 0
  const editAvailable = editSelectedProduct
    ? roundTo(roundTo(editSelectedProduct.productStock, 3) + editHeldQty, 3)
    : null

  const handleSubmitEdit = (event) => {
    event.preventDefault()

    if (
      !editFormData.typeInventory ||
      !editFormData.productName ||
      !editFormData.quantity
    ) {
      setError('Completa los campos requeridos')
      return
    }

    if (
      copy.checkStock &&
      editSelectedProduct &&
      editAvailable < roundTo(editFormData.quantity, 3)
    ) {
      setError(`Stock insuficiente. Disponible: ${formatQty(editAvailable)}`)
      return
    }

    action.mutate(
      { id: record._id, body: editFormData },
      { onSuccess: () => handleClose() }
    )
  }

  const editProducts = withSelection(pageProducts, editFormData.productName)
  const cartProducts = withSelection(pageProducts, itemForm.productName)

  if (isEditing) {
    return (
      <Dialog open={modalShow} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {copy.title}</DialogTitle>
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
                  <Label htmlFor="typeInventory">Tipo de {copy.title} *</Label>
                  <Select value={editFormData.typeInventory} disabled>
                    <SelectTrigger id="typeInventory">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {movementType && (
                        <SelectItem value={movementType.value}>
                          {movementType.label}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="productName">Producto *</Label>
                  <ProductCombobox
                    id="productName"
                    products={editProducts}
                    value={editFormData.productName}
                    onValueChange={(value) =>
                      setEditField('productName', value)
                    }
                    onQueryChange={setProductQuery}
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
                  {copy.checkStock && editAvailable != null && (
                    <small className="text-muted-foreground">
                      Stock disponible: {formatQty(editAvailable)}
                    </small>
                  )}
                </div>
                <div>
                  <Label htmlFor="productPrice">{copy.priceLabel}</Label>
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
                {withPayment && (
                  <div>
                    <Label htmlFor="paymentTypeEdit">Tipo de pago</Label>
                    <Select
                      value={editFormData.paymentType || undefined}
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
                )}
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
          <DialogTitle>Nueva {copy.title}</DialogTitle>
        </DialogHeader>
        <form
          autoComplete="off"
          onSubmit={handleCartFormSubmit}
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
                    onChange={(event) => setDate(event.target.value)}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="productName">Producto</Label>
                  <ProductCombobox
                    id="productName"
                    products={cartProducts}
                    value={itemForm.productName}
                    onValueChange={(value) =>
                      setItemField('productName', value)
                    }
                    onQueryChange={setProductQuery}
                    placeholder="Selecciona producto"
                    showStock
                    stockText={copy.checkStock ? stockText : undefined}
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
                  {copy.checkStock && selectedFigures && (
                    <p className="text-xs text-muted-foreground">
                      Stock: {formatQty(selectedFigures.original)}
                      {' · '}
                      En carrito: {formatQty(selectedFigures.inCart)}
                      {' · '}
                      Disponible: {formatQty(selectedFigures.available)}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="productPrice">{copy.priceLabel}</Label>
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
                  type="submit"
                  name="add"
                  className="sm:col-span-2 lg:col-span-1 lg:self-end"
                >
                  + Agregar al carrito
                </Button>
              </div>
              <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 lg:self-stretch">
                <Label>Carrito ({cart.length})</Label>
                {copy.checkStock && cart.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Stock es el del almacén. Disponible resta este carrito y
                    no cambia el almacén hasta registrar.
                  </p>
                )}
                {cart.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center py-10 text-center text-sm text-muted-foreground">
                    Aún no hay productos en el carrito
                  </div>
                ) : (
                  <>
                    <ul className="space-y-2 lg:hidden">
                      {cart.map((item) => {
                        const figures = copy.checkStock
                          ? stockFigures(item.productName, item.originalStock)
                          : null
                        return (
                        <li
                          key={item.tempId}
                          className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3"
                        >
                          <div className="min-w-0">
                            <p className="break-words text-sm font-medium">
                              {item.productLabel}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Cant. {item.quantity}
                              {figures &&
                                ` · Stock: ${formatQty(figures.original)} · Disponible: ${formatQty(figures.available)}`}
                              {' · '}$
                              {parseFloat(item.totalAmount || 0).toFixed(2)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(item.tempId)}
                            title="Quitar"
                          >
                            ✕
                          </Button>
                        </li>
                        )
                      })}
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
                          {cart.map((item) => {
                            const figures = copy.checkStock
                              ? stockFigures(item.productName, item.originalStock)
                              : null
                            return (
                            <TableRow key={item.tempId}>
                              <TableCell>
                                {item.productLabel}
                                {figures && (
                                  <p className="text-xs text-muted-foreground">
                                    Stock: {formatQty(figures.original)}
                                    {' · '}
                                    Disponible: {formatQty(figures.available)}
                                  </p>
                                )}
                              </TableCell>
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
                                  onClick={() => removeItem(item.tempId)}
                                  title="Quitar"
                                >
                                  ✕
                                </Button>
                              </TableCell>
                            </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="px-2 py-1 text-right text-sm">
                      Total: <strong>{formatMoney(cartTotal)}</strong>
                    </div>
                    {withPayment && (
                      <div>
                        <Label htmlFor="cartPaymentType">
                          Tipo de pago de la salida *
                        </Label>
                        <Select
                          value={cartPaymentType || undefined}
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
                    )}
                  </>
                )}
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              type="submit"
              name="register"
              disabled={cart.length === 0 || isSubmitting}
            >
              {isSubmitting
                ? 'Registrando...'
                : `Registrar ${cart.length || ''} ${
                    cart.length === 1 ? copy.noun : `${copy.noun}s`
                  }`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default MovementModal
