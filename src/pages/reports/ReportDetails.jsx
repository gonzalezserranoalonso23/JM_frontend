import { Card } from '@/components/ui/card'

const ReportDetails = () => {
  return (
    <div className="py-6">
      <div className="page-content-shell">
        <section aria-labelledby="report-details-title">
          <Card className="p-4 sm:p-6">
            <h1 id="report-details-title" className="text-2xl font-semibold">
              Detalle de reporte
            </h1>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default ReportDetails
