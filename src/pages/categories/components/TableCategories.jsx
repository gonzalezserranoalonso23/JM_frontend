const TableCategories = ({ categories, handleUpdate, handleDelete }) => {
  return (
    <div className="table-wrapper">
      <table className="table-minimal">
        <thead>
          <tr>
            <th>Categoría</th>
            <th className="text-center">Opciones</th>
          </tr>
        </thead>
        <tbody>
          {categories?.map((category) => (
            <tr key={category?._id}>
              <td>{category?.categories}</td>
              <td className="text-center">
                <button
                  className="btn-action btn-info-sm mr-2"
                  onClick={() => handleUpdate(category)}
                >
                  Editar
                </button>
                <button
                  className="btn-action btn-danger-sm"
                  onClick={() => handleDelete(category?._id)}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <caption className="text-sm text-gray-500 mt-2">
          Total: {categories?.length}
        </caption>
      </table>
    </div>
  )
}

export default TableCategories
