import { useState } from 'react'
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { useGetProducts } from '@/features/products.features'
import { useGetSuppliers } from '@/features/suppliers.features'
import '@/styles/inventory.css'

const ModalOrderRequest = ({ modalShow, handleClose, action }) => {
  const { data: products } = useGetProducts()
  const { data: suppliers } = useGetSuppliers()

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    items: []
  })

  const [currentItem, setCurrentItem] = useState({
    product: '',
    quantity: '',
    price: ''
  })

  const filteredProducts = products?.filter((product) => {
    if (!formData.supplier) return false

    const supplierValue = product?.supplier
    if (!supplierValue) return false

    return typeof supplierValue === 'object'
      ? supplierValue?._id === formData.supplier
      : supplierValue === formData.supplier
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'supplier') {
      setCurrentItem((prev) => ({ ...prev, product: '', price: '' }))
    }
  }

  const handleItemChange = (e) => {
    const { name, value } = e.target
    setCurrentItem((prev) => ({ ...prev, [name]: value }))

    if (name === 'product') {
      const selected = products?.find((p) => p._id === value)
      if (selected) {
        setCurrentItem((prev) => ({
          ...prev,
          price: selected.purchasePrice ?? selected.productPrice ?? 0
        }))
      }
    }
  }

  const setSupplier = (value) => {
    setFormData((prev) => ({ ...prev, supplier: value }))
    setCurrentItem((prev) => ({ ...prev, product: '', price: '' }))
  }

  const setProduct = (value) => {
    const selected = products?.find((p) => p._id === value)
    setCurrentItem({
      product: value,
      quantity: currentItem.quantity,
      price: selected
        ? (selected.purchasePrice ?? selected.productPrice ?? 0)
        : ''
    })
  }

  const addItem = () => {
    if (!currentItem.product || !currentItem.quantity || !currentItem.price) {
      window.alert('Completa todos los campos')
      return
    }

    const newItem = {
      productId: currentItem.product,
      productName: products?.find((p) => p._id === currentItem.product)
        ?.productName,
      quantity: parseFloat(currentItem.quantity),
      price: parseFloat(currentItem.price),
      subtotal: parseFloat(currentItem.quantity) * parseFloat(currentItem.price)
    }

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem]
    }))

    setCurrentItem({ product: '', quantity: '', price: '' })
  }

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const getTotalAmount = () => {
    return formData.items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.supplier || formData.items.length === 0) {
      window.alert('Selecciona proveedor y agrega productos')
      return
    }

    const dataToSubmit = {
      ...formData,
      totalAmount: getTotalAmount(),
      status: 'pendiente'
    }

    action.mutate(dataToSubmit, {
      onSuccess: () => {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          supplier: '',
          items: []
        })
        setCurrentItem({ product: '', quantity: '', price: '' })
        handleClose()
      }
    })
  }

  return (
    <Dialog open={modalShow} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nueva Solicitud de Pedido</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <DialogBody>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Proveedor *</Label>
                  <Select value={formData.supplier} onValueChange={setSupplier}>
                    <SelectTrigger id="supplier">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.suppliersName || s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[2fr_1fr_1fr_auto]">
                  <div>
                    <Label htmlFor="product">Producto</Label>
                    <Select
                      value={currentItem.product}
                      onValueChange={setProduct}
                      disabled={!formData.supplier}
                    >
                      <SelectTrigger id="product">
                        <SelectValue
                          placeholder={
                            !formData.supplier
                              ? 'Selecciona un proveedor'
                              : filteredProducts?.length
                                ? 'Selecciona'
                                : 'Sin productos'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProducts?.map((p) => (
                          <SelectItem key={p._id} value={p._id}>
                            {p.productName}
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
                      placeholder="Cantidad"
                      value={currentItem.quantity}
                      onChange={handleItemChange}
                      min="1"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Precio compra</Label>
                    <Input
                      id="price"
                      type="number"
                      name="price"
                      placeholder="Precio compra"
                      value={currentItem.price}
                      disabled
                    />
                  </div>

                  <div className="mb-4 flex w-full self-end md:mb-0 md:w-auto">
                    <Button
                      type="button"
                      onClick={addItem}
                      className="min-h-[42px] w-full whitespace-nowrap md:w-auto"
                    >
                      Agregar producto
                    </Button>
                  </div>
                </div>
              </div>

              {formData.items.length > 0 && (
                <div className="table-wrapper">
                  <table className="table-minimal">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th className="text-center">Cantidad</th>
                        <th className="text-right">Precio compra</th>
                        <th className="text-right">Subtotal</th>
                        <th className="text-center">Opciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong>{item?.productName}</strong>
                          </td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-right">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="text-right">
                            ${item.subtotal.toFixed(2)}
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="btn-action btn-danger-sm"
                            >
                              Borrar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {formData.items.length > 0 && (
                <div className="rounded-lg bg-gray-50 p-4 text-right dark:bg-gray-800">
                  <strong className="text-base">
                    Total: ${getTotalAmount().toFixed(2)}
                  </strong>
                </div>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">Crear Solicitud</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalOrderRequest
