import { Link } from 'react-router-dom'
import { Table, Button } from 'react-bootstrap'

const TableCatalogs = () => {
  return (
    <>
      <section className="mx-1 my-4">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Productos</td>
              <td>
                <Link to="../products">
                  <Button size="sm" variant="info">
                    Ver
                  </Button>
                </Link>
              </td>
            </tr>
            <tr>
              <td>Proveedores</td>
              <td>
                <Link to="../suppliers">
                  <Button size="sm" variant="info">
                    Ver
                  </Button>
                </Link>
              </td>
            </tr>
            <tr>
              <td>Categorías</td>
              <td>
                <Link to="../categories">
                  <Button size="sm" variant="info">
                    Ver
                  </Button>
                </Link>
              </td>
            </tr>
            <tr>
              <td>Usuarios</td>
              <td>
                <Link to="../users">
                  <Button size="sm" variant="info">
                    Ver
                  </Button>
                </Link>
              </td>
            </tr>
          </tbody>
        </Table>
      </section>
    </>
  )
}

export default TableCatalogs
