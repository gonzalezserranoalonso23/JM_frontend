import TableCatalogs from './components/TableCatalogs'

const Catalogs = () => {
  return (
    <>
      <div className="bg-light py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 page-content-shell">
          <section
            className="section-container"
            aria-labelledby="catalog-title"
          >
            <header className="section-header">
              <h1 id="catalog-title" className="section-title">
                Catálogo
              </h1>
            </header>
            <TableCatalogs />
          </section>
        </div>
      </div>
    </>
  )
}

export default Catalogs
