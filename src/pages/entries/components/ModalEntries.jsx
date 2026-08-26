import { useEffect, useState } from 'react'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  TextInput,
  Select,
  Textarea
} from 'flowbite-react'
import { useGetProducts } from '../../../features/products.features'
import '../../../styles/inventory.css'

const ENTRY_TYPE = 'ENTRY'

const getEmptyForm = () => ({
  date: new Date().toISOString().split('T')[0],
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
  record,
  isEditing
}) => {
  const { data: products } = useGetProducts()

  const [formData, setFormData] = useState(getEmptyForm())

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'productName') {
      const selectedProduct = products?.find((p) => p._id === value)
      if (selectedProduct) {
        setFormData((prev) => ({
          ...prev,
          category: selectedProduct.category._id,
          productPrice: selectedProduct.productPrice
        }))
      }
    }

    if (name === 'quantity' || name === 'productPrice') {
      const qty =
        name === 'quantity' ? parseFloat(value) : parseFloat(formData.quantity)
      const price =
        name === 'productPrice'
          ? parseFloat(value)
          : parseFloat(formData.productPrice)
      if (qty && price) {
        setFormData((prev) => ({
          ...prev,
          totalAmount: (qty * price).toFixed(2)
        }))
      }
    }
  }

  useEffect(() => {
    if (!record) {
      setFormData(getEmptyForm())
      return
    }

    setFormData({
      date: record.date
        ? new Date(record.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      typeInventory: record.typeInventory || ENTRY_TYPE,
      productName: record.productName?._id || record.productName || '',
      category: record.category?._id || record.category || '',
      productPrice: record.productPrice || '',
      quantity: record.quantity || '',
      totalAmount: record.totalAmount || '',
      Observations: record.Observations || ''
    })
  }, [record])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (
      !formData.typeInventory ||
      !formData.productName ||
      !formData.quantity
    ) {
      window.alert('Completa los campos requeridos')
      return
    }

    const payload = { ...formData }

    const request = record?._id ? { id: record._id, body: payload } : payload

    action.mutate(request, {
      onSuccess: () => {
        setFormData(getEmptyForm())
        handleClose()
      }
    })
  }

  return (
    <Modal
      show={modalShow}
      onClose={handleClose}
      size="md"
      className="z-[9999]"
    >
      <ModalHeader>
        {isEditing ? 'Editar Entrada' : 'Nueva Entrada'}
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody className="pb-6">
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="date"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Fecha *
              </label>
              <TextInput
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label
                htmlFor="typeInventory"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Tipo de Entrada *
              </label>
              <Select
                id="typeInventory"
                name="typeInventory"
                value={formData.typeInventory}
                disabled
                required
              >
                <option value={ENTRY_TYPE}>{ENTRY_TYPE}</option>
              </Select>
            </div>

            <div>
              <label
                htmlFor="productName"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Producto *
              </label>
              <Select
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona producto</option>
                {products?.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.productName} (Stock: {p.productStock})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Cantidad *
              </label>
              <TextInput
                id="quantity"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label
                htmlFor="productPrice"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Precio Unitario
              </label>
              <TextInput
                id="productPrice"
                type="number"
                name="productPrice"
                value={formData.productPrice}
                disabled
              />
            </div>

            <div>
              <label
                htmlFor="totalAmount"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Total
              </label>
              <TextInput
                id="totalAmount"
                type="number"
                value={formData.totalAmount}
                disabled
              />
            </div>

            <div>
              <label
                htmlFor="Observations"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Observaciones
              </label>
              <Textarea
                id="Observations"
                name="Observations"
                value={formData.Observations}
                onChange={handleChange}
                placeholder="Notas adicionales..."
                rows={3}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="pt-4 pb-6 px-6 gap-3">
          <Button type="button" color="dark" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" color="success">
            {isEditing ? 'Guardar cambios' : 'Registrar'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default ModalEntries
