import { formatDate } from '@/utils/dateDisplay'
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

const TableEntries = ({ records, handleDelete }) => {
  return (
    <div className="table-responsive">
      <table className="table-minimal table-static">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Producto</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Precio Unit.</th>
            <th>Monto Total</th>
            <th>Usuario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {records?.map((record) => (
            <tr key={record._id}>
              <td>{formatDate(record.date)}</td>
              <td>{record.productName?.productName}</td>
              <td>{getTypeValue(record)}</td>
              <td className="text-center">{record.quantity}</td>
              <td className="text-right">
                ${parseFloat(record.productPrice).toFixed(2)}
              </td>
              <td className="text-right">
                ${parseFloat(record.totalAmount).toFixed(2)}
              </td>
              <td>{record.User?.username || 'N/A'}</td>
              <td>
                <button
                  type="button"
                  className="min-h-11 rounded-md bg-gray-800 px-3 text-sm font-medium text-white transition-colors hover:bg-gray-700"
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

export default TableEntries
