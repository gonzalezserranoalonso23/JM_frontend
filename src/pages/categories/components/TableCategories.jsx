import { Table, Button, Alert, ButtonGroup } from 'react-bootstrap'

const TableCategories = ({ categories, handleUpdate, handleDelete }) => {
  return (
    <>
      {categories?.length > 0 ? (
        <div className="data-tables bg-light rounded p-1 my-1">
          <Table responsive size="sm" borderless variant="light" hover>
            <thead className="border-bottom">
              <tr>
                <th>Categoria</th>
                <th>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map((category) => (
                <tr key={category?._id}>
                  <td>{category?.categories}</td>
                  <td>
                    <ButtonGroup>
                      <Button
                        className="btn btn-warning btn-sm mx-1 rounded"
                        data={category?._id}
                        onClick={() => handleUpdate(category)}
                      >
                        Editar
                      </Button>
                      <Button
                        className="btn btn-danger btn-sm  mx-1 rounded"
                        data={category?._id}
                        onClick={() => handleDelete(category?._id)}
                      >
                        Borrar
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
            <caption className="mx-1 text-dark">
              Total de categorías {categories?.length}
            </caption>
          </Table>
        </div>
      ) : (
        <Alert variant="warning">No hay categorías para mostrar!</Alert>
      )}
    </>
  )
}

export default TableCategories
