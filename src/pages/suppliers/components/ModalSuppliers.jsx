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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { useFormik } from 'formik'
import { validateSupplier } from '@/helpers/validations'

const ModalSuppliers = ({
  supplier,
  modalShow,
  handleClose,
  action,
  type,
  setUpdate
}) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      suppliersName: supplier?.suppliersName || '',
      suppliersContact: supplier?.suppliersContact || '',
      supplierPhone: supplier?.supplierPhone || '',
      raiseOrder: supplier?.raiseOrder || '',
      deliverOrder: supplier?.deliverOrder || '',
      isActive: supplier?.isActive || ''
    },
    validate: validateSupplier,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
      action.mutate(
        !supplier?._id ? values : { id: supplier?._id, body: values }
      )
      formik.resetForm()
      handleClose()
    }
  })

  const handleCloseUpdate = () => {
    formik.resetForm()
    setUpdate(false)
    handleClose()
  }

  return (
    <Dialog
      open={modalShow}
      onOpenChange={(open) => !open && handleCloseUpdate()}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{type} proveedor</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <DialogBody>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="suppliersName">Nombre del Proveedor</Label>
                <Input
                  {...formik.getFieldProps('suppliersName')}
                  id="suppliersName"
                  type="text"
                  name="suppliersName"
                />
              </div>
              <div>
                <Label htmlFor="suppliersContact">Contacto</Label>
                <Input
                  {...formik.getFieldProps('suppliersContact')}
                  id="suppliersContact"
                  type="text"
                  name="suppliersContact"
                />
              </div>
              <div>
                <Label htmlFor="supplierPhone">Teléfono</Label>
                <Input
                  {...formik.getFieldProps('supplierPhone')}
                  id="supplierPhone"
                  type="text"
                  name="supplierPhone"
                />
              </div>
              <div>
                <Label htmlFor="raiseOrder">Pedido</Label>
                <Input
                  {...formik.getFieldProps('raiseOrder')}
                  id="raiseOrder"
                  type="text"
                  name="raiseOrder"
                />
              </div>
              <div>
                <Label htmlFor="deliverOrder">Entrega</Label>
                <Input
                  {...formik.getFieldProps('deliverOrder')}
                  id="deliverOrder"
                  type="text"
                  name="deliverOrder"
                />
              </div>
              <div>
                <Label htmlFor="isActive">Estatus</Label>
                <Select
                  value={formik.values.isActive?.toString()}
                  onValueChange={(value) =>
                    formik.setFieldValue('isActive', value)
                  }
                >
                  <SelectTrigger id="isActive">
                    <SelectValue placeholder="Selecciona el estatus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseUpdate}>
              Cerrar
            </Button>
            <Button type="submit">{type} proveedor</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalSuppliers
