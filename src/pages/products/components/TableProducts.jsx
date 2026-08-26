const TableProducts = ({ products, handleUpdate, handleDelete }) => {
  return (
    <div className="table-wrapper">
      <table className="table-minimal">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Descripción</th>
            <th>Compra</th>
            <th>Venta</th>
            <th>Stock</th>
            <th>Stock mín.</th>
            <th>Proveedor</th>
            <th>Categoría</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((product) => (
            <tr key={product?._id}>
              <td>
                <strong>{product?.productName}</strong>
              </td>
              <td>
                <small>{product?.productDescription}</small>
              </td>
              <td>${product?.purchasePrice ?? 0}</td>
              <td>${product?.productPrice ?? 0}</td>
              <td>
                <span
                  className={`badge-minimal ${
                    product?.productStock === 0
                      ? 'badge-danger'
                      : product?.productStock <= product?.minimumProductStock
                        ? 'badge-warning'
                        : 'badge-success'
                  }`}
                >
                  {product?.productStock}
                </span>
              </td>
              <td>{product?.minimumProductStock}</td>
              <td>
                <small>{product?.supplier?.suppliersName}</small>
              </td>
              <td>
                <small>{product?.category?.categories}</small>
              </td>
              <td className="text-center">
                <button
                  className="btn-action btn-info-sm mr-2"
                  onClick={() => handleUpdate(product)}
                >
                  Editar
                </button>
                <button
                  className="btn-action btn-danger-sm"
                  onClick={() => handleDelete(product?._id)}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <caption className="text-sm text-gray-500 mt-2">
          Total: {products?.length} productos
        </caption>
      </table>
    </div>
  )
}

export default TableProducts
