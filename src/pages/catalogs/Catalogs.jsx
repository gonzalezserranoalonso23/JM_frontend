import Navigate from '../../ui/Navigate'
import TableCatalogs from './components/TableCatalogs'

const Catalogs = () => {
  return (
    <>
      <Navigate />
      <div className="min-h-screen bg-light pt-20">
        <div className="max-w-3xl mx-auto px-4">
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
