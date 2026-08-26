const getTypeValue = (record) => {
  if (typeof record?.typeInventory === 'string') {
    return record.typeInventory.toUpperCase()
  }

  const legacy = record?.typeInventory?.typeInventory || ''
  const normalized = legacy.toLowerCase().trim()
  if (normalized.includes('salida') || normalized.includes('venta')) {
    return 'ISSUE'
  }

  return 'ENTRY'
}

const TableIssues = ({ records, handleDelete }) => {
  return (
    <div className="table-wrapper">
      <table className="table-minimal">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Producto</th>
            <th>Tipo</th>
            <th className="text-center">Cantidad</th>
            <th className="text-right">Precio Unit.</th>
            <th className="text-right">Total</th>
            <th>Usuario</th>
            <th>Notas</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {records?.map((record) => (
            <tr key={record._id}>
              <td>{new Date(record.date).toLocaleDateString()}</td>
              <td>
                <strong>{record.productName?.productName}</strong>
              </td>
              <td>{getTypeValue(record)}</td>
              <td className="text-center">{record.quantity}</td>
              <td className="text-right">
                ${parseFloat(record.productPrice).toFixed(2)}
              </td>
              <td className="text-right">
                <strong>${parseFloat(record.totalAmount).toFixed(2)}</strong>
              </td>
              <td>
                <small>{record.User?.username || 'N/A'}</small>
              </td>
              <td>
                <small>{record.Observations || '-'}</small>
              </td>
              <td className="text-center">
                <button
                  className="btn-action btn-danger-sm"
                  onClick={() => handleDelete(record._id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableIssues
