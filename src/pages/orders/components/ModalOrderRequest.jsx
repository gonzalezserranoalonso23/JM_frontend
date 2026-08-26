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
import { useGetProducts } from '../../../features/products.features'
import { useQuery } from '@tanstack/react-query'
import axios from '../../../libs/axios'
import '../../../styles/inventory.css'

const ModalOrderRequest = ({ modalShow, handleClose, action }) => {
  const { data: products } = useGetProducts()
  const { data: suppliers } = useQuery({
    queryKey: ['Suppliers'],
    queryFn: async () => {
      const { data } = await axios.get('/api/suppliers')
      return data
    }
  })

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
          price: selected.productPrice
        }))
      }
    }
  }

  const addItem = () => {
    if (!currentItem.product || !currentItem.quantity || !currentItem.price) {
      alert('Completa todos los campos')
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
      alert('Selecciona proveedor y agrega productos')
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
      className="z-[9999]"
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
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <h6 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Productos
              </h6>
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
                  >
                    <option value="">Selecciona</option>
                    {products?.map((p) => (
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
                    Precio
                  </label>
                  <TextInput
                    id="price"
                    type="number"
                    name="price"
                    placeholder="Precio"
                    value={currentItem.price}
                    disabled
                  />
                </div>

                <Button type="button" onClick={addItem} className="w-full">
                  +
                </Button>
              </div>
            </div>

            {formData.items.length > 0 && (
              <div className="flex flex-col gap-2">
                {formData.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                  >
                    <div className="flex-1">
                      <strong className="block">{item.productName}</strong>
                      <small className="text-gray-500 dark:text-gray-400">
                        {item.quantity} × ${item.price.toFixed(2)} = $
                        {item.subtotal.toFixed(2)}
                      </small>
                    </div>
                    <Button
                      type="button"
                      color="failure"
                      size="xs"
                      onClick={() => removeItem(idx)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
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
        <ModalFooter>
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
