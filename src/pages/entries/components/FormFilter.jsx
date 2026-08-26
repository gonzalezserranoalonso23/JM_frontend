import { Form, Row, Col } from 'react-bootstrap'

const FormFilter = ({ name, dataFilter, setDataFilter }) => {
  return (
    <Form className="mb-3">
      <Row>
        <Col xs={12} sm={6} md={4}>
          <Form.Group>
            <Form.Label>Buscar por {name}</Form.Label>
            <Form.Control
              type="text"
              placeholder={`Buscar ${name}...`}
              value={dataFilter}
              onChange={(e) => setDataFilter(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
    </Form>
  )
}

export default FormFilter
