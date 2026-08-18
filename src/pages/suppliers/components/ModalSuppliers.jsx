/* eslint-disable react/jsx-boolean-value */
import { Modal, Form, Button } from 'react-bootstrap'
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
    <>
      <Modal
        className="text-dark"
        show={modalShow}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>{type} proveedor</Modal.Title>
        </Modal.Header>
        <Form onSubmit={formik.handleSubmit}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Nombre del Proveedor</Form.Label>
              <Form.Control
                {...formik.getFieldProps('suppliersName')}
                type="text"
                name="suppliersName"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Contacto</Form.Label>
              <Form.Control
                {...formik.getFieldProps('suppliersContact')}
                type="text"
                name="suppliersContact"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                {...formik.getFieldProps('supplierPhone')}
                type="text"
                name="supplierPhone"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Pedido</Form.Label>
              <Form.Control
                {...formik.getFieldProps('raiseOrder')}
                type="text"
                name="raiseOrder"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Entrega</Form.Label>
              <Form.Control
                {...formik.getFieldProps('deliverOrder')}
                type="text"
                name="deliverOrder"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Estatus</Form.Label>
              <Form.Select
                id="isActive"
                name="isActive"
                {...formik.getFieldProps('isActive')}
              >
                <option>Selecciona el estatus</option>

                <option value={true}>Activo</option>
                <option value={false}>Inactivo</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="dark" onClick={handleCloseUpdate}>
              Cerrar
            </Button>
            <Button variant="warning" type="submit">
              {type} proveedor
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default ModalSuppliers
