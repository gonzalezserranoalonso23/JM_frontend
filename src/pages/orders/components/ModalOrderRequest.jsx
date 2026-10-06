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
import { toast } from 'react-hot-toast'
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
import Loading from '@/ui/Loading'

const ModalOrderRequest = ({ modalShow, handleClose, action, order }) => {
  const { data: products, isLoading: loadingProducts } = useGetProducts()
  const { data: suppliers, isLoading: loadingSuppliers } = useGetSuppliers()

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

  useEffect(() => {
    if (!modalShow) return

    if (order) {
      setFormData({
        date: order.date
          ? new Date(order.date).toISOString().split('T')[0]
          : '',
        supplier:
          typeof order.supplier === 'object'
            ? order.supplier?._id || ''
            : order.supplier || '',
        items: (order.items || []).map((item) => ({
          ...item,
          productId:
            typeof item.productId === 'object'
              ? item.productId?._id || ''
              : item.productId || '',
          subtotal:
            Number(item.subtotal) || Number(item.quantity) * Number(item.price)
        }))
      })
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        supplier: '',
        items: []
      })
    }
    setCurrentItem({ product: '', quantity: '', price: '' })
  }, [modalShow, order])

  const filteredProducts = products?.filter((product) => {
    if (!formData.supplier) return false

    const supplierValue = product?.supplier
    if (!supplierValue) return false

    return typeof supplierValue === 'object'
      ? supplierValue?._id === formData.supplier
      : supplierValue === formData.supplier
  })
  const selectedProduct = products?.find(
    (product) => product._id === currentItem.product
  )

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

    setFormData((prev) => {
      const existingItem = prev.items.find(
        (item) => String(item.productId) === String(newItem.productId)
      )

      if (!existingItem) {
        return { ...prev, items: [...prev.items, newItem] }
      }

      return {
        ...prev,
        items: prev.items.map((item) => {
          if (String(item.productId) !== String(newItem.productId)) return item

          const quantity = Number(item.quantity) + newItem.quantity
          return {
            ...item,
            quantity,
            subtotal: quantity * Number(item.price)
          }
        })
      }
    })

    toast.success('Producto agregado a la solicitud')
    setCurrentItem({ product: '', quantity: '', price: '' })
  }

  const removeItem = (index) => {
    const removedItem = formData.items[index]
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
    toast.success(
      `Producto ${removedItem?.productName || ''} eliminado de la solicitud`
    )
  }

  const getTotalAmount = () => {
    return formData.items.reduce(
      (sum, item) =>
        sum +
        (Number(item.subtotal) || Number(item.quantity) * Number(item.price)),
      0
    )
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
      status: order?.status || 'pendiente'
    }

    action.mutate(
      order ? { id: order._id, body: dataToSubmit } : dataToSubmit,
      {
        onSuccess: () => {
          setFormData({
            date: new Date().toISOString().split('T')[0],
            supplier: '',
            items: []
          })
          setCurrentItem({ product: '', quantity: '', price: '' })
          handleClose()
        }
      }
    )
  }

  return (
    <Dialog open={modalShow} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {order ? 'Editar Solicitud de Pedido' : 'Nueva Solicitud de Pedido'}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <DialogBody>
            {(loadingProducts || loadingSuppliers) && (
              <Loading fullScreen={false} />
            )}
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
                      <SelectTrigger
                        id="product"
                        className="disabled:opacity-100"
                      >
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
                      <SelectContent side="top" sideOffset={4}>
                        {filteredProducts?.map((p) => (
                          <SelectItem
                            key={p._id}
                            value={p._id}
                            textValue={p.productName}
                          >
                            <span className="flex flex-col">
                              <span>{p.productName}</span>
                              {p.productDescription && (
                                <span className="text-xs text-muted-foreground">
                                  {p.productDescription}
                                </span>
                              )}
                            </span>
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
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label htmlFor="currentProductStock">Stock actual</Label>
                    <Input
                      id="currentProductStock"
                      type="number"
                      value={selectedProduct?.productStock ?? ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimumProductStock">Stock mínimo</Label>
                    <Input
                      id="minimumProductStock"
                      type="number"
                      value={selectedProduct?.minimumProductStock ?? ''}
                      readOnly
                    />
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
                        <th className="text-center">Stock actual</th>
                        <th className="text-center">Stock mínimo</th>
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
                          <td className="text-center">
                            {products?.find(
                              (product) =>
                                product._id ===
                                (typeof item.productId === 'object'
                                  ? item.productId?._id
                                  : item.productId)
                            )?.productStock ?? 0}
                          </td>
                          <td className="text-center">
                            {products?.find(
                              (product) =>
                                product._id ===
                                (typeof item.productId === 'object'
                                  ? item.productId?._id
                                  : item.productId)
                            )?.minimumProductStock ?? 0}
                          </td>
                          <td className="text-right">
                            ${Number(item.price || 0).toFixed(2)}
                          </td>
                          <td className="text-right">
                            $
                            {(
                              Number(item.subtotal) ||
                              Number(item.quantity) * Number(item.price)
                            ).toFixed(2)}
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
                <div className="rounded-lg bg-white p-4 text-right text-gray-900 dark:bg-white dark:text-gray-900">
                  <strong className="text-base text-gray-900">
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
            <Button type="submit">
              {order ? 'Guardar cambios' : 'Crear Solicitud'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalOrderRequest
