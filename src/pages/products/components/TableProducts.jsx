import { Table, Button, Alert, ButtonGroup } from 'react-bootstrap'

const TableProducts = ({ products, handleUpdate, handleDelete }) => {
  return (
    <>
      {products?.length > 0 ? (
        <div className="data-tables bg-light rounded p-1 my-1">
          <Table responsive size="sm" borderless variant="light" hover>
            <thead className="border-bottom">
              <tr>
                <th>Producto</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Stock mínimo</th>
                <th>Proveedor</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => (
                <tr key={product?._id}>
                  <td>{product?.productName}</td>
                  <td>{product?.productDescription}</td>
                  <td>{product?.productPrice}</td>
                  <td>{product?.productStock}</td>
                  <td>{product?.minimumProductStock}</td>
                  <td>{product?.supplier?.suppliersName}</td>
                  <td>{product?.category?.categories}</td>

                  <td>
                    <ButtonGroup>
                      <Button
                        className="btn btn-warning btn-sm mx-1 rounded"
                        data={product?._id}
                        onClick={() => handleUpdate(product)}
                      >
                        Editar
                      </Button>
                      <Button
                        className="btn btn-danger btn-sm  mx-1 rounded"
                        data={product?._id}
                        onClick={() => handleDelete(product?._id)}
                      >
                        Borrar
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
            <caption className="mx-1 text-dark">
              Total de productos {products?.length}
            </caption>
          </Table>
        </div>
      ) : (
        <Alert variant="warning">No hay prdoductos para mostrar!</Alert>
      )}
    </>
  )
}

export default TableProducts
