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

const ISSUE_TYPE = 'ISSUE'

const getEmptyForm = () => ({
  date: new Date().toISOString().split('T')[0],
  typeInventory: ISSUE_TYPE,
  productName: '',
  category: '',
  productPrice: '',
  quantity: '',
  totalAmount: '',
  Observations: ''
})

const ModalIssues = ({ modalShow, handleClose, action, record, isEditing }) => {
  const { data: products } = useGetProducts()

  const [formData, setFormData] = useState(getEmptyForm())

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')

    if (name === 'productName') {
      const product = products?.find((p) => p._id === value)
      setSelectedProduct(product)
      if (product) {
        setFormData((prev) => ({
          ...prev,
          category: product.category._id,
          productPrice: product.productPrice
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
      setSelectedProduct(null)
      setError('')
      return
    }

    setFormData({
      date: record.date
        ? new Date(record.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
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
    setSelectedProduct(product || null)
    setError('')
  }, [record, products])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (
      !formData.typeInventory ||
      !formData.productName ||
      !formData.quantity
    ) {
      setError('Completa los campos requeridos')
      return
    }

    if (
      selectedProduct &&
      selectedProduct.productStock < parseFloat(formData.quantity)
    ) {
      setError(
        `Stock insuficiente. Disponible: ${selectedProduct.productStock}`
      )
      return
    }

    const payload = { ...formData }
    const request = record?._id ? { id: record._id, body: payload } : payload

    action.mutate(request, {
      onSuccess: () => {
        setFormData(getEmptyForm())
        setSelectedProduct(null)
        setError('')
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
      <ModalHeader>{isEditing ? 'Editar Salida' : 'Nueva Salida'}</ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody className="pb-6">
          <div className="flex flex-col gap-4">
            {error && (
              <div className="alert-minimal alert-danger-minimal">{error}</div>
            )}

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
                Tipo de Salida *
              </label>
              <Select
                id="typeInventory"
                name="typeInventory"
                value={formData.typeInventory}
                disabled
                required
              >
                <option value={ISSUE_TYPE}>{ISSUE_TYPE}</option>
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
              {selectedProduct && (
                <small style={{ color: '#7f8c8d' }}>
                  Stock disponible: {selectedProduct.productStock}
                </small>
              )}
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
                placeholder="Notas (ej: venta cliente X)..."
                rows={3}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="pt-4 pb-6 px-6 gap-3">
          <Button type="button" color="dark" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" color="failure">
            {isEditing ? 'Guardar cambios' : 'Registrar'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default ModalIssues
