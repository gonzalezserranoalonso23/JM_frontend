import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  TextInput,
  Select
} from 'flowbite-react'
import { useFormik } from 'formik'
import { validateProduct } from '../../../helpers/validations'
import { useGetCategories } from '../../../features/categories.features'
import { useGetSuppliers } from '../../../features/suppliers.features'

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
    <Modal
      show={modalShow}
      onClose={handleCloseUpdate}
      size="lg"
      className="z-[9999]"
    >
      <ModalHeader>{type} producto</ModalHeader>
      <form onSubmit={formik.handleSubmit}>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="productName"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Nombre
              </label>
              <TextInput
                {...formik.getFieldProps('productName')}
                id="productName"
                type="text"
                name="productName"
              />
            </div>
            <div>
              <label
                htmlFor="productDescription"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Descripción
              </label>
              <TextInput
                {...formik.getFieldProps('productDescription')}
                id="productDescription"
                type="text"
                name="productDescription"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="purchasePrice"
                  className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                  Precio de compra
                </label>
                <TextInput
                  {...formik.getFieldProps('purchasePrice')}
                  id="purchasePrice"
                  type="number"
                  name="purchasePrice"
                />
              </div>
              <div>
                <label
                  htmlFor="productPrice"
                  className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                  Precio de venta
                </label>
                <TextInput
                  {...formik.getFieldProps('productPrice')}
                  id="productPrice"
                  type="number"
                  name="productPrice"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="minimumProductStock"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Stock mínimo
              </label>
              <TextInput
                {...formik.getFieldProps('minimumProductStock')}
                id="minimumProductStock"
                type="number"
                name="minimumProductStock"
              />
            </div>
            <div>
              <label
                htmlFor="productStock"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Stock actual
              </label>
              <TextInput
                {...formik.getFieldProps('productStock')}
                id="productStock"
                type="number"
                name="productStock"
              />
            </div>
            <div>
              <label
                htmlFor="supplier"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Proveedor
              </label>
              <Select
                id="supplier"
                name="supplier"
                {...formik.getFieldProps('supplier')}
              >
                <option value="">Selecciona el proveedor</option>
                {suppliers?.map((s) => (
                  <option key={s?._id} value={s?._id}>
                    {s?.suppliersName}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Categoría
              </label>
              <Select
                id="category"
                name="category"
                {...formik.getFieldProps('category')}
              >
                <option value="">Selecciona la categoría</option>
                {categories?.map((c) => (
                  <option key={c?._id} value={c?._id}>
                    {c?.categories}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="dark" onClick={handleCloseUpdate}>
            Cerrar
          </Button>
          <Button color="warning" type="submit">
            {type} producto
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default ModalProducts
