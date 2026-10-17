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
import { useFormik } from 'formik'
import { validatePaymentType } from '@/helpers/validations'

const ModalPaymentTypes = ({
  paymentType,
  modalShow,
  handleClose,
  action,
  type
}) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { paymentType: paymentType?.label || '' },
    validate: validatePaymentType,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
      const body = { paymentType: values.paymentType.trim().toUpperCase() }
      action.mutate(paymentType ? { id: paymentType.value, body } : body, {
        onSuccess: handleCloseAndReset
      })
    }
  })

  const handleCloseAndReset = () => {
    formik.resetForm()
    handleClose()
  }

  return (
    <Dialog
      open={modalShow}
      onOpenChange={(open) => !open && handleCloseAndReset()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type} método de pago</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <DialogBody>
            <div>
              <Label htmlFor="paymentType">Método de pago</Label>
              <Input
                {...formik.getFieldProps('paymentType')}
                id="paymentType"
                type="text"
                name="paymentType"
                placeholder="Ej. EFECTIVO"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseAndReset}
            >
              Cerrar
            </Button>
            <Button
              type="submit"
              className="bg-cyan-900 text-white hover:bg-cyan-950"
            >
              {type} método
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalPaymentTypes
