import { useState } from 'react'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  TextInput,
  Select
} from 'flowbite-react'
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
    <Modal
      show={modalShow}
      onClose={handleClose}
      size="lg"
      className="order-request-modal z-[9999]"
    >
      <ModalHeader>Nueva Solicitud de Pedido</ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="date"
                  className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                  Fecha
                </label>
                <TextInput
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="supplier"
                  className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                  Proveedor *
                </label>
                <Select
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona</option>
                  {suppliers?.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.suppliersName || s.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[2fr_1fr_1fr_auto]">
                <div>
                  <label
                    htmlFor="product"
                    className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
                  >
                    Producto
                  </label>
                  <Select
                    id="product"
                    name="product"
                    value={currentItem.product}
                    onChange={handleItemChange}
                    disabled={!formData.supplier}
                  >
                    <option value="">
                      {!formData.supplier
                        ? 'Selecciona un proveedor'
                        : filteredProducts?.length
                          ? 'Selecciona'
                          : 'Sin productos'}
                    </option>
                    {filteredProducts?.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.productName}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label
                    htmlFor="quantity"
                    className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
                  >
                    Cantidad
                  </label>
                  <TextInput
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
                  <label
                    htmlFor="price"
                    className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
                  >
                    Precio compra
                  </label>
                  <TextInput
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
                        <td className="text-right">${item.price.toFixed(2)}</td>
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
        </ModalBody>
        <ModalFooter className="order-request-actions">
          <Button type="button" color="dark" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" color="primary">
            Crear Solicitud
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default ModalOrderRequest
