import { Card } from '@/components/ui/card'

const IssueDetails = () => {
  return (
    <div className="py-6">
      <div className="page-content-shell">
        <section aria-labelledby="issue-details-title">
          <Card className="p-4 sm:p-6">
            <h1 id="issue-details-title" className="text-2xl font-semibold">
              Detalle de salida
            </h1>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default IssueDetails
