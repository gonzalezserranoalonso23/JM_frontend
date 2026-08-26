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
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                  <button
                    className="btn-action btn-info-sm w-full sm:w-auto"
                    onClick={() => handleUpdate(category)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-action btn-danger-sm w-full sm:w-auto"
                    onClick={() => handleDelete(category?._id)}
                  >
                    Borrar
                  </button>
                </div>
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
