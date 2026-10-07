import { todayLocal } from '@/utils/dateDisplay'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const getInitialValues = (record) => ({
  date: record?.date || todayLocal(),
  cashSales: record?.cashSales ?? '',
  cardSales: record?.cardSales ?? '',
  totalTransactions: record?.totalTransactions ?? ''
})

const ModalDailyInformation = ({ record, modalShow, handleClose, action }) => {
  const [formData, setFormData] = useState(getInitialValues(record))

  useEffect(() => {
    if (modalShow) setFormData(getInitialValues(record))
  }, [modalShow, record])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const cashSales = Number(formData.cashSales)
    const cardSales = Number(formData.cardSales)
    const body = {
      date: formData.date,
      cashSales,
      cardSales,
      totalSales: cashSales + cardSales,
      totalTransactions: Number(formData.totalTransactions)
    }

    action.mutate(record ? { id: record._id, body } : body, {
      onSuccess: handleClose
    })
  }

  return (
    <Dialog open={modalShow} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {record ? 'Editar información diaria' : 'Nuevo registro diario'}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <DialogBody>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cashSales">Ventas en efectivo</Label>
                <Input
                  id="cashSales"
                  name="cashSales"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cashSales}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cardSales">Ventas con tarjeta</Label>
                <Input
                  id="cardSales"
                  name="cardSales"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cardSales}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="totalSales">Ventas totales</Label>
                <Input
                  id="totalSales"
                  type="number"
                  value={
                    (Number(formData.cashSales) || 0) +
                    (Number(formData.cardSales) || 0)
                  }
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="totalTransactions">
                  Total de transacciones
                </Label>
                <Input
                  id="totalTransactions"
                  name="totalTransactions"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.totalTransactions}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={action.isPending}>
              {action.isPending ? 'Guardando...' : 'Guardar registro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalDailyInformation
