import { Link } from 'react-router-dom'

const TableCatalogs = () => {
  const items = [
    { name: 'Productos', path: '../products' },
    { name: 'Proveedores', path: '../suppliers' },
    { name: 'Categorías', path: '../categories' },
    { name: 'Usuarios', path: '../users' }
  ]

  return (
    <div className="table-wrapper">
      <table className="table-minimal">
        <thead>
          <tr>
            <th>Nombre</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.name}>
              <td>
                <strong>{item.name}</strong>
              </td>
              <td className="text-center">
                <Link to={item.path} className="btn-action btn-info-sm">
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableCatalogs
