const FormFilter = ({ name, dataFilter, setDataFilter }) => {
  return (
    <div className="filter-section">
      <div className="filter-group">
        <label>Buscar por {name}</label>
        <input
          type="text"
          className="form-control"
          placeholder={`Buscar ${name}...`}
          value={dataFilter}
          onChange={(e) => setDataFilter(e.target.value)}
        />
      </div>
    </div>
  )
}

export default FormFilter
