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

  const setField = (name, value) => {
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

  const handleChange = (e) => {
    setField(e.target.name, e.target.value)
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
    <Dialog open={modalShow} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Salida' : 'Nueva Salida'}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <DialogBody>
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
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="typeInventory">Tipo de Salida *</Label>
                <Select value={formData.typeInventory} disabled>
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
                <Select
                  value={formData.productName}
                  onValueChange={(value) => setField('productName', value)}
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
                <Label htmlFor="productPrice">Precio Unitario</Label>
                <Input
                  id="productPrice"
                  type="number"
                  name="productPrice"
                  value={formData.productPrice}
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="totalAmount">Total</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={formData.totalAmount}
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="Observations">Observaciones</Label>
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
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Guardar cambios' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalIssues
