import { Modal, Form, Button } from 'react-bootstrap'
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
    <>
      <Modal
        className="text-dark"
        show={modalShow}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>{type} categoría</Modal.Title>
        </Modal.Header>
        <Form onSubmit={formik.handleSubmit}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Categoría</Form.Label>
              <Form.Control
                {...formik.getFieldProps('categories')}
                type="text"
                name="categories"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="dark" onClick={handleCloseUpdate}>
              Cerrar
            </Button>
            <Button variant="warning" type="submit">
              {type} categoría
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default ModalCategory
