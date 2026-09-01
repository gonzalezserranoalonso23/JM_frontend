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
import { validateProduct } from '@/helpers/validations'
import { useGetCategories } from '@/features/categories.features'
import { useGetSuppliers } from '@/features/suppliers.features'

const ModalProducts = ({
  product,
  modalShow,
  handleClose,
  action,
  type,
  setUpdate
}) => {
  const { data: categories } = useGetCategories()
  const { data: suppliers } = useGetSuppliers()

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      productName: product?.productName || '',
      productDescription: product?.productDescription || '',
      purchasePrice: product?.purchasePrice || '',
      productPrice: product?.productPrice || '',
      minimumProductStock: product?.minimumProductStock || '',
      productStock: product?.productStock || '',
      supplier: product?.supplier || '',
      category: product?.category || ''
    },
    validate: validateProduct,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
      action.mutate(!product?._id ? values : { id: product?._id, body: values })
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
          <DialogTitle>{type} producto</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <DialogBody>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="productName">Nombre</Label>
                <Input
                  {...formik.getFieldProps('productName')}
                  id="productName"
                  type="text"
                  name="productName"
                />
              </div>
              <div>
                <Label htmlFor="productDescription">Descripción</Label>
                <Input
                  {...formik.getFieldProps('productDescription')}
                  id="productDescription"
                  type="text"
                  name="productDescription"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchasePrice">Precio de compra</Label>
                  <Input
                    {...formik.getFieldProps('purchasePrice')}
                    id="purchasePrice"
                    type="number"
                    name="purchasePrice"
                  />
                </div>
                <div>
                  <Label htmlFor="productPrice">Precio de venta</Label>
                  <Input
                    {...formik.getFieldProps('productPrice')}
                    id="productPrice"
                    type="number"
                    name="productPrice"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="minimumProductStock">Stock mínimo</Label>
                <Input
                  {...formik.getFieldProps('minimumProductStock')}
                  id="minimumProductStock"
                  type="number"
                  name="minimumProductStock"
                />
              </div>
              <div>
                <Label htmlFor="productStock">Stock actual</Label>
                <Input
                  {...formik.getFieldProps('productStock')}
                  id="productStock"
                  type="number"
                  name="productStock"
                />
              </div>
              <div>
                <Label htmlFor="supplier">Proveedor</Label>
                <Select
                  value={formik.values.supplier}
                  onValueChange={(value) =>
                    formik.setFieldValue('supplier', value)
                  }
                >
                  <SelectTrigger id="supplier">
                    <SelectValue placeholder="Selecciona el proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.map((s) => (
                      <SelectItem key={s?._id} value={s?._id}>
                        {s?.suppliersName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formik.values.category}
                  onValueChange={(value) =>
                    formik.setFieldValue('category', value)
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecciona la categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c?._id} value={c?._id}>
                        {c?.categories}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseUpdate}>
              Cerrar
            </Button>
            <Button type="submit">{type} producto</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ModalProducts
