const TableSuppliers = ({ suppliers, handleUpdate, handleDelete }) => {
  return (
    <div className="table-wrapper">
      <table className="table-minimal">
        <thead>
          <tr>
            <th>Proveedor</th>
            <th>Contacto</th>
            <th>Teléfono</th>
            <th>Pedido</th>
            <th>Entrega</th>
            <th>Activo</th>
            <th className="text-center">Opciones</th>
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
              <td>
                <span
                  className={`badge-minimal ${supplier?.isActive ? 'badge-success' : 'badge-danger'}`}
                >
                  {supplier?.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="text-center">
                <button
                  className="btn-action btn-info-sm mr-2"
                  onClick={() => handleUpdate(supplier)}
                >
                  Editar
                </button>
                <button
                  className="btn-action btn-danger-sm"
                  onClick={() => handleDelete(supplier?._id)}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <caption className="text-sm text-gray-500 mt-2">
          Total: {suppliers?.length}
        </caption>
      </table>
    </div>
  )
}

export default TableSuppliers
