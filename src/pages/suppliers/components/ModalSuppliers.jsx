/* eslint-disable react/jsx-boolean-value */
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
import { validateSupplier } from '../../../helpers/validations'

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
    <Modal
      show={modalShow}
      onClose={handleCloseUpdate}
      size="lg"
      className="z-[9999]"
    >
      <ModalHeader>{type} proveedor</ModalHeader>
      <form onSubmit={formik.handleSubmit}>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="suppliersName"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Nombre del Proveedor
              </label>
              <TextInput
                {...formik.getFieldProps('suppliersName')}
                id="suppliersName"
                type="text"
                name="suppliersName"
              />
            </div>
            <div>
              <label
                htmlFor="suppliersContact"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Contacto
              </label>
              <TextInput
                {...formik.getFieldProps('suppliersContact')}
                id="suppliersContact"
                type="text"
                name="suppliersContact"
              />
            </div>
            <div>
              <label
                htmlFor="supplierPhone"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Teléfono
              </label>
              <TextInput
                {...formik.getFieldProps('supplierPhone')}
                id="supplierPhone"
                type="text"
                name="supplierPhone"
              />
            </div>
            <div>
              <label
                htmlFor="raiseOrder"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Pedido
              </label>
              <TextInput
                {...formik.getFieldProps('raiseOrder')}
                id="raiseOrder"
                type="text"
                name="raiseOrder"
              />
            </div>
            <div>
              <label
                htmlFor="deliverOrder"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Entrega
              </label>
              <TextInput
                {...formik.getFieldProps('deliverOrder')}
                id="deliverOrder"
                type="text"
                name="deliverOrder"
              />
            </div>
            <div>
              <label
                htmlFor="isActive"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Estatus
              </label>
              <Select
                id="isActive"
                name="isActive"
                {...formik.getFieldProps('isActive')}
              >
                <option value="">Selecciona el estatus</option>
                <option value={true}>Activo</option>
                <option value={false}>Inactivo</option>
              </Select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="dark" onClick={handleCloseUpdate}>
            Cerrar
          </Button>
          <Button color="warning" type="submit">
            {type} proveedor
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default ModalSuppliers
