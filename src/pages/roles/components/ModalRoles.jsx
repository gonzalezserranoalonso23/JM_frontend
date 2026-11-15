import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { useFormik } from 'formik'

const ModalRoles = ({ role, modalShow, handleClose, action, type, setUpdate }) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { name: role?.name || '' },
    validate: (values) => {
      if (!values.name?.trim()) return { name: 'El nombre es requerido' }
    },
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
      const body = { name: values.name.trim() }
      action.mutate(!role?._id ? body : { id: role._id, body }, {
        onSuccess: handleCloseUpdate
      })
    }
  })

  const handleCloseUpdate = () => {
    formik.resetForm()
    setUpdate(false)
    handleClose()
  }

  return (
    <Dialog open={modalShow} onOpenChange={(open) => !open && handleCloseUpdate()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type} rol</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <DialogBody>
            <div>
              <Label htmlFor="role-name">Nombre</Label>
              <Input
                id="role-name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
              />
              {formik.errors.name && (
                <p className="mt-1 text-sm text-destructive">{formik.errors.name}</p>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseUpdate}>
              Cerrar
            </Button>
            <Button type="submit">{type} rol</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalRoles
