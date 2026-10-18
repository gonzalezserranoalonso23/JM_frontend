import { Card } from '@/components/ui/card'

const EntryDetails = () => {
  return (
    <div className="py-6">
      <div className="page-content-shell">
        <section aria-labelledby="entry-details-title">
          <Card className="p-4 sm:p-6">
            <h1 id="entry-details-title" className="text-2xl font-semibold">
              Detalle de entrada
            </h1>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default EntryDetails
