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

const ENTRY_TYPE = 'ENTRY'

const getToday = () => new Date().toISOString().split('T')[0]

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
  typeInventory: ENTRY_TYPE,
  productName: '',
  category: '',
  productPrice: '',
  quantity: '',
  totalAmount: '',
  Observations: ''
})

const ModalEntries = ({
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

  // Estado exclusivo para editar un registro existente
  const [editFormData, setEditFormData] = useState(getEmptyEditForm())

  const applyDerivedFields = (values, name, value) => {
    let next = { ...values, [name]: value }

    if (name === 'productName') {
      const selectedProduct = products?.find((p) => p._id === value)
      if (selectedProduct) {
        next = {
          ...next,
          category: selectedProduct.category._id,
          productPrice: selectedProduct.purchasePrice
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

  const setItemField = (name, value) => {
    setItemForm((prev) => applyDerivedFields(prev, name, value))
  }

  const handleItemChange = (e) => setItemField(e.target.name, e.target.value)

  const setEditField = (name, value) => {
    setEditFormData((prev) => applyDerivedFields(prev, name, value))
  }

  const handleEditChange = (e) => setEditField(e.target.name, e.target.value)

  useEffect(() => {
    if (isEditing && record) {
      setEditFormData({
        date: record.date
          ? new Date(record.date).toISOString().split('T')[0]
          : getToday(),
        typeInventory: record.typeInventory || ENTRY_TYPE,
        productName: record.productName?._id || record.productName || '',
        category: record.category?._id || record.category || '',
        productPrice: record.productPrice || '',
        quantity: record.quantity || '',
        totalAmount: record.totalAmount || '',
        Observations: record.Observations || ''
      })
    }
  }, [record, isEditing])

  useEffect(() => {
    if (!modalShow) {
      setDate(getToday())
      setItemForm(getEmptyItem())
      setCart([])
      setEditFormData(getEmptyEditForm())
    }
  }, [modalShow])

  const handleAddToCart = () => {
    if (!itemForm.productName || !itemForm.quantity) {
      window.alert('Selecciona un producto y una cantidad')
      return
    }

    const product = products?.find((p) => p._id === itemForm.productName)

    setCart((prev) => [
      ...prev,
      {
        ...itemForm,
        tempId: `${Date.now()}-${Math.random()}`,
        productLabel: product?.productName || ''
      }
    ])
    setItemForm(getEmptyItem())
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
      window.alert('Agrega al menos un producto al carrito')
      return
    }

    setIsSubmitting(true)
    const records = cart.map(({ tempId, productLabel, ...payload }) => ({
      ...payload,
      quantity: Number(payload.quantity),
      totalAmount: Number(payload.totalAmount),
      date,
      typeInventory: ENTRY_TYPE
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
      window.alert('Completa los campos requeridos')
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
            <DialogTitle>Editar Entrada</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmitEdit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <DialogBody>
              {loadingProducts && <Loading fullScreen={false} />}
              <div className="flex flex-col gap-4">
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
                  <Label htmlFor="typeInventory">Tipo de Entrada *</Label>
                  <Select value={editFormData.typeInventory} disabled>
                    <SelectTrigger id="typeInventory">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ENTRY_TYPE}>{ENTRY_TYPE}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="productName">Producto *</Label>
                  <Select
                    value={editFormData.productName}
                    onValueChange={(value) =>
                      setEditField('productName', value)
                    }
                  >
                    <SelectTrigger id="productName">
                      <SelectValue placeholder="Selecciona producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.productName} (Stock: {p.productStock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    placeholder="Notas adicionales..."
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
          <DialogTitle>Nueva Entrada</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmitCart}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <DialogBody>
            {loadingProducts && <Loading fullScreen={false} />}
            <div className="flex flex-col gap-4">
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
                  <Select
                    value={itemForm.productName}
                    onValueChange={(value) =>
                      setItemField('productName', value)
                    }
                  >
                    <SelectTrigger id="productName">
                      <SelectValue placeholder="Selecciona producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.productName} (Stock: {p.productStock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    placeholder="Notas adicionales..."
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
                          <th></th>
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
                : `Registrar ${cart.length || ''} entrada${
                    cart.length === 1 ? '' : 's'
                  }`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalEntries
