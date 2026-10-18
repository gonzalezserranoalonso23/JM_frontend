import { Card } from '@/components/ui/card'
import TableCatalogs from './components/TableCatalogs'

const Catalogs = () => {
  return (
    <>
      <div className="py-6">
        <div className="page-content-shell">
          <Card
            role="region"
            aria-labelledby="catalog-title"
            className="gap-4 p-4 sm:p-6"
          >
            <header className="flex flex-wrap items-center justify-between gap-2">
              <h1 id="catalog-title" className="text-xl font-semibold">
                Catálogo
              </h1>
            </header>
            <TableCatalogs />
          </Card>
        </div>
      </div>
    </>
  )
}

export default Catalogs
