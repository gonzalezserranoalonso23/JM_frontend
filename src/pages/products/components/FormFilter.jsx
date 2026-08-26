const FormFilter = ({ name, dataFilter, setDataFilter }) => {
  return (
    <div className="filter-section">
      <div className="filter-group" style={{ flex: 1, maxWidth: '400px' }}>
        <input
          className="form-control"
          placeholder={`Buscar ${name}...`}
          name={name}
          value={dataFilter}
          onChange={(event) => setDataFilter(event.target.value)}
        />
      </div>
    </div>
  )
}

export default FormFilter
