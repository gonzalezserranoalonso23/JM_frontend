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
import { validateCategory } from '@/helpers/validations'

const ModalCategory = ({
  category,
  modalShow,
  handleClose,
  action,
  type,
  setUpdate
}) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      categories: category?.categories || ''
    },
    validate: validateCategory,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
      action.mutate(
        !category?._id ? values : { id: category?._id, body: values }
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type} categoría</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <DialogBody>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="categories">Categoría</Label>
                <Input
                  {...formik.getFieldProps('categories')}
                  id="categories"
                  type="text"
                  name="categories"
                  placeholder="Nombre de la categoría"
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseUpdate}>
              Cerrar
            </Button>
            <Button type="submit">{type} categoría</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalCategory
