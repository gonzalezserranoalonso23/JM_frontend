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

  const setField = (name, value) => {
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

  const handleChange = (e) => {
    setField(e.target.name, e.target.value)
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
    <Dialog open={modalShow} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Entrada' : 'Nueva Entrada'}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <DialogBody>
            <div className="flex flex-col gap-4">
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
                <Label htmlFor="typeInventory">Tipo de Entrada *</Label>
                <Select value={formData.typeInventory} disabled>
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
            <Button type="submit">
              {isEditing ? 'Guardar cambios' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalEntries
