const formatAmount = (amount) =>
  Number(amount || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN'
  })

const TableDailyInformation = ({ records, handleUpdate, handleDelete }) => (
  <div className="table-wrapper">
    <table className="table-minimal">
      <thead>
        <tr>
          <th>Fecha</th>
          <th className="text-right">Efectivo</th>
          <th className="text-right">Tarjeta</th>
          <th className="text-right">Ventas totales</th>
          <th className="text-center">Transacciones</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr key={record._id}>
            <td>{record.date}</td>
            <td className="text-right">{formatAmount(record.cashSales)}</td>
            <td className="text-right">{formatAmount(record.cardSales)}</td>
            <td className="text-right">{formatAmount(record.totalSales)}</td>
            <td className="text-center">{record.totalTransactions}</td>
            <td className="text-center">
              <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
                <button
                  type="button"
                  className="btn-action btn-info-sm w-full sm:w-auto"
                  onClick={() => handleUpdate(record)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn-action btn-danger-sm w-full sm:w-auto"
                  onClick={() => handleDelete(record._id)}
                >
                  Borrar
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
      <caption className="mt-2 text-sm text-gray-500">
        Total: {records.length} registros
      </caption>
    </table>
  </div>
)

export default TableDailyInformation
