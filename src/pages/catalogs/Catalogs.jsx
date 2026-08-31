import TableCatalogs from './components/TableCatalogs'

const Catalogs = () => {
  return (
    <>
      <div className="bg-light py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 page-content-shell">
          <div className="section-container">
            <div className="section-header">
              <h4 className="section-title">Catálogo</h4>
            </div>
            <TableCatalogs />
          </div>
        </div>
      </div>
    </>
  )
}

export default Catalogs
