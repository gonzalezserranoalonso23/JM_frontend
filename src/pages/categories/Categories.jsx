import Navigate from '../../ui/Navigate'
import { Container, Row, Col } from 'react-bootstrap'
import SectionCategories from './components/SectionCategories'

const Categories = () => {
  return (
    <>
      <Navigate />
      <Container fluid className="p-0 ">
        <Row className="my-2 mx-auto">
          <Col xs={12} lg={8} className="mx-auto my-1">
            <SectionCategories />
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Categories
