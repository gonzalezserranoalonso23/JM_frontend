import { Modal, Form, Button } from 'react-bootstrap'
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
    <>
      <Modal
        className="text-dark"
        show={modalShow}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>{type} producto</Modal.Title>
        </Modal.Header>
        <Form onSubmit={formik.handleSubmit}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                {...formik.getFieldProps('productName')}
                type="text"
                name="productName"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                {...formik.getFieldProps('productDescription')}
                type="text"
                name="productDescription"
              />
              <Form.Label>Precio</Form.Label>
              <Form.Control
                {...formik.getFieldProps('productPrice')}
                type="number"
                name="productPrice"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Stock mínimo</Form.Label>
              <Form.Control
                {...formik.getFieldProps('minimumProductStock')}
                type="number"
                name="minimumProductStock"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Stock actual</Form.Label>
              <Form.Control
                {...formik.getFieldProps('productStock')}
                type="number"
                name="productStock"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Proveedor:</Form.Label>
              <Form.Select
                id="supplier"
                name="supplier"
                {...formik.getFieldProps('supplier')}
              >
                <option value={false}>
                  Selecciona el proveedor al que pertenece
                </option>
                {suppliers?.map((supplier) => (
                  <option key={supplier?._id} value={supplier?._id}>
                    {supplier?.suppliersName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Categoria:</Form.Label>
              <Form.Select
                id="category"
                name="category"
                {...formik.getFieldProps('category')}
              >
                <option value={false}>
                  Selecciona la categoría a la que pertenece
                </option>
                {categories?.map((category) => (
                  <option key={category?._id} value={category?._id}>
                    {category?.categories}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="dark" onClick={handleCloseUpdate}>
              Cerrar
            </Button>
            <Button variant="warning" type="submit">
              {type} producto
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default ModalProducts
