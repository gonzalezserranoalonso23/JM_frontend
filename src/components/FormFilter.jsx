const FormFilter = ({
  id = 'filter-query',
  label = 'Buscar',
  placeholder = 'Buscar...',
  value,
  onChange
}) => (
  <form
    className="filter-section"
    role="search"
    aria-label={label}
    onSubmit={(event) => event.preventDefault()}
  >
    <div className="filter-group" style={{ flex: 1, maxWidth: '400px' }}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="search"
        className="form-control"
        placeholder={placeholder}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  </form>
)

export default FormFilter
