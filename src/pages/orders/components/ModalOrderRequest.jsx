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
import { toast } from 'react-hot-toast'
import ProductCombobox from '@/components/ui/product-combobox'
import { useGetProducts } from '@/features/products.features'
import { useGetSuppliers } from '@/features/suppliers.features'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'
import Loading from '@/ui/Loading'

const ModalOrderRequest = ({ modalShow, handleClose, action, order }) => {
  const {
    data: products,
    isLoading: loadingProducts,
    refetch: refetchProducts
  } = useGetProducts({ poll: Boolean(modalShow) })

  // Otra persona pudo mover el stock mientras la página estaba abierta
  useEffect(() => {
    if (modalShow) refetchProducts()
  }, [modalShow, refetchProducts])
  const { data: suppliers } = useGetSuppliers()
  const suppliersById = Object.fromEntries(
    (suppliers ?? []).map((s) => [s._id, s.suppliersName || s.name])
  )

  const [formData, setFormData] = useState({
    date: todayLocal(),
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
        date: order.date ? isoDay(order.date) : '',
        items: (order.items || []).map((item) => ({
          ...item,
          supplier:
            typeof item.supplier === 'object'
              ? item.supplier?._id || ''
              : item.supplier || '',
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
        items: []
      })
    }
    setCurrentItem({ product: '', quantity: '', price: '' })
  }, [modalShow, order])

  const activeProducts = (products ?? []).filter((p) => p?.isActive !== false)
  const selectedProduct = products?.find(
    (product) => product._id === currentItem.product
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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

    const selected = products?.find((p) => p._id === currentItem.product)
    const supplierValue = selected?.supplier
    const newItem = {
      productId: currentItem.product,
      supplier:
        typeof supplierValue === 'object'
          ? supplierValue?._id || ''
          : supplierValue || '',
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
    if (!window.confirm('¿Quitar este producto de la solicitud?')) return
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
    return itemsTotal
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (formData.items.length === 0) {
      window.alert('Agrega productos')
      return
    }

    const dataToSubmit = {
      ...formData,
      supplier: formData.items.find((item) => item.supplier)?.supplier,
      totalAmount: getTotalAmount(),
      status: order?.status || 'pendiente'
    }

    action.mutate(
      order ? { id: order._id, body: dataToSubmit } : dataToSubmit,
      {
        onSuccess: () => {
          setFormData({
            date: todayLocal(),
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
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {order ? 'Editar Solicitud de Pedido' : 'Nueva Solicitud de Pedido'}
          </DialogTitle>
        </DialogHeader>
        <form
          autoComplete="off"
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <DialogBody>
            {loadingProducts && <Loading fullScreen={false} />}
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
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="min-w-0 md:col-span-2 lg:col-span-4">
                  <Label htmlFor="product">Producto</Label>
                  <ProductCombobox
                    id="product"
                    products={activeProducts}
                    value={currentItem.product}
                    onValueChange={setProduct}
                  />
                </div>
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
                <div className="md:col-span-2 lg:col-span-4">
                  <Button
                    type="button"
                    onClick={addItem}
                    className="w-full whitespace-nowrap md:w-auto"
                  >
                    Agregar producto
                  </Button>
                </div>
              </div>

              {formData.items.length > 0 && (
                <ul className="space-y-2 lg:hidden">
                  {formData.items.map((item, idx) => {
                    const productId =
                      typeof item.productId === 'object'
                        ? item.productId?._id
                        : item.productId
                    const product = products?.find((p) => p._id === productId)
                    const supplierId =
                      typeof item.supplier === 'object'
                        ? item.supplier?._id
                        : item.supplier
                    return (
                      <li key={idx} className="space-y-2 rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="break-words text-sm font-medium">
                              {item?.productName}
                            </p>
                            <p className="break-words text-xs text-muted-foreground">
                              {suppliersById[supplierId] || '-'}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(idx)}
                          >
                            Borrar
                          </Button>
                        </div>
                        <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
                          <div>
                            <dt className="text-xs text-muted-foreground">
                              Cantidad
                            </dt>
                            <dd>{item.quantity}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground">
                              Stock actual
                            </dt>
                            <dd>{product?.productStock ?? 0}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground">
                              Stock mín.
                            </dt>
                            <dd>{product?.minimumProductStock ?? 0}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground">
                              Precio
                            </dt>
                            <dd>${Number(item.price || 0).toFixed(2)}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground">
                              Subtotal
                            </dt>
                            <dd className="font-semibold">
                              $
                              {(
                                Number(item.subtotal) ||
                                Number(item.quantity) * Number(item.price)
                              ).toFixed(2)}
                            </dd>
                          </div>
                        </dl>
                      </li>
                    )
                  })}
                </ul>
              )}

              {formData.items.length > 0 && (
                <div className="hidden rounded-lg border lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-center">
                          Stock actual
                        </TableHead>
                        <TableHead className="text-center">
                          Stock mínimo
                        </TableHead>
                        <TableHead className="text-right">
                          Precio compra
                        </TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-center">Opciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <strong className="break-words">
                              {item?.productName}
                            </strong>
                          </TableCell>
                          <TableCell>
                            {suppliersById[
                              typeof item.supplier === 'object'
                                ? item.supplier?._id
                                : item.supplier
                            ] || '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-center">
                            {products?.find(
                              (product) =>
                                product._id ===
                                (typeof item.productId === 'object'
                                  ? item.productId?._id
                                  : item.productId)
                            )?.productStock ?? 0}
                          </TableCell>
                          <TableCell className="text-center">
                            {products?.find(
                              (product) =>
                                product._id ===
                                (typeof item.productId === 'object'
                                  ? item.productId?._id
                                  : item.productId)
                            )?.minimumProductStock ?? 0}
                          </TableCell>
                          <TableCell className="text-right">
                            ${Number(item.price || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            $
                            {(
                              Number(item.subtotal) ||
                              Number(item.quantity) * Number(item.price)
                            ).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeItem(idx)}
                            >
                              Borrar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </DialogBody>
          <DialogFooter className="flex-col max-sm:gap-1 max-sm:p-2 max-sm:[&_button]:h-10">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between max-sm:items-stretch max-sm:gap-2">
              <strong className="text-base text-foreground max-sm:self-end">
                Total: ${getTotalAmount().toFixed(2)}
              </strong>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3 max-sm:flex-row max-sm:gap-2">
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
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
