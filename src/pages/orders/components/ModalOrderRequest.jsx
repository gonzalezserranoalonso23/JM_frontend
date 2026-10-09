import { todayLocal, isoDay } from '@/utils/dateDisplay'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
    date: todayLocal(),
    supplier: '',
    items: []
  })

  const [currentItem, setCurrentItem] = useState({
    product: '',
    quantity: '',
    price: ''
  })
  const [includesTax, setIncludesTax] = useState(true)
  const [taxAmount, setTaxAmount] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [productOpen, setProductOpen] = useState(false)
  const productInputRef = useRef(null)
  const [listPos, setListPos] = useState(null)

  useEffect(() => {
    if (!productOpen) return
    const input = productInputRef.current
    const dialog = input?.closest('[role="dialog"]')
    if (!input || !dialog) return
    const i = input.getBoundingClientRect()
    const d = dialog.getBoundingClientRect()
    const below = d.bottom - i.bottom
    const openUp = below < 220 && i.top - d.top > below
    setListPos({
      dialog,
      left: i.left - d.left,
      width: i.width,
      ...(openUp
        ? { bottom: d.bottom - i.top + 4 }
        : { top: i.bottom - d.top + 4 })
    })
  }, [productOpen])

  useEffect(() => {
    if (!modalShow) return

    if (order) {
      setFormData({
        date: order.date ? isoDay(order.date) : '',
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
        date: todayLocal(),
        supplier: '',
        items: []
      })
    }
    setCurrentItem({ product: '', quantity: '', price: '' })
    setIncludesTax(true)
    setTaxAmount('')
  }, [modalShow, order])

  const filteredProducts = products?.filter((product) => {
    if (!formData.supplier) return false
    if (product?.isActive === false) return false

    const supplierValue = product?.supplier
    if (!supplierValue) return false

    return typeof supplierValue === 'object'
      ? supplierValue?._id === formData.supplier
      : supplierValue === formData.supplier
  })
  const normalize = (v) =>
    String(v ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  const searchedProducts = (filteredProducts ?? []).filter((p) => {
    const q = normalize(productSearch.trim())
    return (
      !q ||
      normalize(p.productName).includes(q) ||
      normalize(p.productDescription).includes(q)
    )
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
    const itemsTotal = formData.items.reduce(
      (sum, item) =>
        sum +
        (Number(item.subtotal) || Number(item.quantity) * Number(item.price)),
      0
    )
    return itemsTotal + (includesTax ? 0 : Number(taxAmount) || 0)
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
            date: todayLocal(),
            supplier: '',
            items: []
          })
          setCurrentItem({ product: '', quantity: '', price: '' })
          setIncludesTax(true)
          setTaxAmount('')
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
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
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
                  <div className="min-w-0">
                    <Label htmlFor="product">Producto</Label>
                    <div>
                      <Input
                        id="product"
                        ref={productInputRef}
                        autoComplete="off"
                        className="truncate disabled:opacity-100"
                        disabled={!formData.supplier}
                        value={
                          productOpen
                            ? productSearch
                            : (selectedProduct?.productName ?? '')
                        }
                        placeholder={
                          !formData.supplier
                            ? 'Selecciona un proveedor'
                            : filteredProducts?.length
                              ? 'Buscar producto'
                              : 'Sin productos activos'
                        }
                        onFocus={() => {
                          setProductSearch('')
                          setProductOpen(true)
                        }}
                        onChange={(e) => {
                          setProductSearch(e.target.value)
                          setProductOpen(true)
                        }}
                        onBlur={() => setProductOpen(false)}
                      />
                      {productOpen &&
                        listPos &&
                        createPortal(
                          <div
                            style={{
                              position: 'absolute',
                              left: listPos.left,
                              width: listPos.width,
                              top: listPos.top,
                              bottom: listPos.bottom
                            }}
                            className="z-[100] max-h-48 overflow-y-scroll rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2"
                          >
                            {searchedProducts.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                Sin resultados
                              </div>
                            ) : (
                              searchedProducts.map((p) => (
                                <button
                                  type="button"
                                  key={p._id}
                                  className="block w-full min-w-0 px-3 py-2 text-left hover:bg-[var(--bg-subtle)]"
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    setProduct(p._id)
                                    setProductOpen(false)
                                    setProductSearch('')
                                  }}
                                >
                                  <span className="block truncate text-sm">
                                    {p.productName}
                                  </span>
                                  {p.productDescription && (
                                    <span className="block truncate text-xs text-muted-foreground">
                                      {p.productDescription}
                                    </span>
                                  )}
                                </button>
                              ))
                            )}
                          </div>,
                          listPos.dialog
                        )}
                    </div>
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
                            <strong className="break-words">
                              {item?.productName}
                            </strong>
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
            </div>
          </DialogBody>
          <DialogFooter className="flex-col max-sm:[&_button]:flex-none">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="flex min-h-10 items-center gap-2 text-sm font-medium text-white">
                  <input
                    type="checkbox"
                    checked={includesTax}
                    onChange={(event) => setIncludesTax(event.target.checked)}
                    className="h-4 w-4 accent-white"
                  />
                  Incluye impuestos
                </label>
                {!includesTax && (
                  <div className="sm:w-48">
                    <Label htmlFor="taxAmount" className="text-white">
                      Impuesto
                    </Label>
                    <Input
                      id="taxAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Cantidad de impuesto"
                      value={taxAmount}
                      onChange={(event) => setTaxAmount(event.target.value)}
                    />
                  </div>
                )}
              </div>
              <strong className="text-base text-white">
                Total: ${getTotalAmount().toFixed(2)}
              </strong>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {order ? 'Guardar cambios' : 'Crear Solicitud'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalOrderRequest
