import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  TextInput
} from 'flowbite-react'
import { useFormik } from 'formik'
import { validateCategory } from '../../../helpers/validations'

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
    <Modal
      show={modalShow}
      onClose={handleCloseUpdate}
      size="md"
      className="z-[9999]"
    >
      <ModalHeader>{type} categoría</ModalHeader>
      <form onSubmit={formik.handleSubmit}>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="categories"
                className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Categoría
              </label>
              <TextInput
                {...formik.getFieldProps('categories')}
                id="categories"
                type="text"
                name="categories"
                placeholder="Nombre de la categoría"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="dark" onClick={handleCloseUpdate}>
            Cerrar
          </Button>
          <Button color="warning" type="submit">
            {type} categoría
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default ModalCategory
