import { Table, Button, Alert, ButtonGroup } from 'react-bootstrap'

const TableSuppliers = ({ suppliers, handleUpdate, handleDelete }) => {
  return (
    <>
      {suppliers?.length > 0 ? (
        <div className="data-tables bg-light rounded p-1 my-1">
          <Table responsive size="sm" borderless variant="light" hover>
            <thead className="border-bottom">
              <tr>
                <th>Proveedor</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Pedido</th>
                <th>Entrega</th>
                <th>Activo</th>
                <th>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {suppliers?.map((supplier) => (
                <tr key={supplier?._id}>
                  <td>{supplier?.suppliersName}</td>
                  <td>{supplier?.suppliersContact}</td>
                  <td>{supplier?.supplierPhone}</td>
                  <td>{supplier?.raiseOrder}</td>
                  <td>{supplier?.deliverOrder}</td>
                  <td>{supplier?.isActive ? 'Sí' : 'No'}</td>
                  <td>
                    <ButtonGroup>
                      <Button
                        className="btn btn-warning btn-sm mx-1 rounded"
                        data={supplier?._id}
                        onClick={() => handleUpdate(supplier)}
                      >
                        Editar
                      </Button>
                      <Button
                        className="btn btn-danger btn-sm  mx-1 rounded"
                        data={supplier?._id}
                        onClick={() => handleDelete(supplier?._id)}
                      >
                        Borrar
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
            <caption className="mx-1 text-dark">
              Total de proveedores {suppliers?.length}
            </caption>
          </Table>
        </div>
      ) : (
        <Alert variant="warning">No hay proveedores para mostrar!</Alert>
      )}
    </>
  )
}

export default TableSuppliers
