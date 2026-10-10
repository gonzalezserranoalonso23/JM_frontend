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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ProductCombobox from '@/components/ui/product-combobox'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { useGetProducts } from '@/features/products.features'
import '../../../styles/inventory.css'
import Loading from '@/ui/Loading'

const ISSUE_TYPE = 'ISSUE'

const getToday = () => todayLocal()

const getEmptyItem = () => ({
  productName: '',
  category: '',
  productPrice: '',
  quantity: '',
  totalAmount: '',
  Observations: ''
})

const getEmptyEditForm = () => ({
  date: getToday(),
  typeInventory: ISSUE_TYPE,
  productName: '',
  category: '',
  productPrice: '',
  quantity: '',
  totalAmount: '',
  Observations: ''
})

const ModalIssues = ({
  modalShow,
  handleClose,
  action,
  createBulkAction,
  record,
  isEditing
}) => {
  const { data: products, isLoading: loadingProducts } = useGetProducts()

  // Carrito: los productos se van sumando localmente, sin hacer una
  // petición POST por cada uno. Solo al "Registrar" se envían todos.
  const [date, setDate] = useState(getToday())
  const [itemForm, setItemForm] = useState(getEmptyItem())
  const [cart, setCart] = useState([])
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

    const qty = parseFloat(next.quantity)
    const price = parseFloat(next.productPrice)
    if (Number.isFinite(qty) && Number.isFinite(price)) {
      next = { ...next, totalAmount: (qty * price).toFixed(2) }
    }

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
        typeInventory: record.typeInventory || ISSUE_TYPE,
        productName: record.productName?._id || record.productName || '',
        category: record.category?._id || record.category || '',
        productPrice: record.productPrice || '',
        quantity: record.quantity || '',
        totalAmount: record.totalAmount || '',
        Observations: record.Observations || ''
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
      setCart([])
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
      setError(`Stock insuficiente. Disponible: ${available}`)
      return
    }

    setCart((prev) => [
      ...prev,
      {
        ...itemForm,
        tempId: `${Date.now()}-${Math.random()}`,
        productLabel: itemSelectedProduct?.productName || ''
      }
    ])
    setItemForm(getEmptyItem())
    setError('')
  }

  const handleRemoveFromCart = (tempId) => {
    setCart((prev) => prev.filter((item) => item.tempId !== tempId))
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + (parseFloat(item.totalAmount) || 0),
    0
  )

  const handleSubmitCart = async (e) => {
    e.preventDefault()

    if (cart.length === 0) {
      setError('Agrega al menos un producto al carrito')
      return
    }

    setIsSubmitting(true)
    const records = cart.map(({ tempId, productLabel, ...payload }) => ({
      ...payload,
      quantity: Number(payload.quantity),
      totalAmount: Number(payload.totalAmount),
      date,
      typeInventory: ISSUE_TYPE
    }))

    try {
      await createBulkAction.mutateAsync(records)
      setCart([])
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
        `Stock insuficiente. Disponible: ${editSelectedProduct.productStock}`
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
            onSubmit={handleSubmitEdit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <DialogBody>
              {loadingProducts && <Loading fullScreen={false} />}
              <div className="flex flex-col gap-4">
                {error && (
                  <div className="alert-minimal alert-danger-minimal">
                    {error}
                  </div>
                )}

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
                      <SelectItem value={ISSUE_TYPE}>{ISSUE_TYPE}</SelectItem>
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
                    step="0.01"
                    min="0"
                    required
                  />
                  {editSelectedProduct && (
                    <small style={{ color: '#7f8c8d' }}>
                      Stock disponible: {editSelectedProduct.productStock}
                    </small>
                  )}
                </div>

                <div>
                  <Label htmlFor="productPrice">Precio Unitario</Label>
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
                  <Label htmlFor="Observations">Observaciones</Label>
                  <Textarea
                    id="Observations"
                    name="Observations"
                    value={editFormData.Observations}
                    onChange={handleEditChange}
                    placeholder="Notas (ej: venta cliente X)..."
                    rows={3}
                  />
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Salida</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmitCart}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <DialogBody>
            {loadingProducts && <Loading fullScreen={false} />}
            <div className="flex flex-col gap-4">
              {error && (
                <div className="alert-minimal alert-danger-minimal">
                  {error}
                </div>
              )}

              <div>
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

              <div className="cart-item-form">
                <div>
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
                    step="0.01"
                    min="0"
                  />
                  {itemSelectedProduct && (
                    <small style={{ color: '#7f8c8d' }}>
                      Stock disponible: {getAvailableStock(itemSelectedProduct)}
                    </small>
                  )}
                </div>

                <div>
                  <Label htmlFor="productPrice">Precio Unitario</Label>
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

                <div>
                  <Label htmlFor="Observations">Observaciones</Label>
                  <Textarea
                    id="Observations"
                    name="Observations"
                    value={itemForm.Observations}
                    onChange={handleItemChange}
                    placeholder="Notas (ej: venta cliente X)..."
                    rows={2}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddToCart}
                >
                  + Agregar al carrito
                </Button>
              </div>

              {cart.length > 0 && (
                <div className="cart-list">
                  <Label>Productos a registrar ({cart.length})</Label>
                  <div className="table-wrapper">
                    <table className="table-minimal">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th style={{ textAlign: 'center' }}>Cant.</th>
                          <th style={{ textAlign: 'right' }}>Total</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item) => (
                          <tr key={item.tempId}>
                            <td>{item.productLabel}</td>
                            <td style={{ textAlign: 'center' }}>
                              {item.quantity}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              ${parseFloat(item.totalAmount || 0).toFixed(2)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="btn-action btn-danger-sm"
                                onClick={() =>
                                  handleRemoveFromCart(item.tempId)
                                }
                                title="Quitar"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="cart-total">
                    Total: <strong>${cartTotal.toFixed(2)}</strong>
                  </div>
                </div>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
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
