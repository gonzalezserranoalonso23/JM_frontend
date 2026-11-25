import PageShell from '@/components/templates/PageShell'
import DailyInformationDashboard from './DailyInformationDashboard'

const StockDashboard = () => {
  return (
    <PageShell>
      <section className="mb-8" aria-labelledby="dashboard-title">
        <header className="mb-6">
          <h1
            id="dashboard-title"
            className="text-xl font-bold text-foreground"
          >
            Dashboard
          </h1>
        </header>

        <div className="mb-6 flex flex-col gap-4">
          <DailyInformationDashboard />
        </div>
      </section>
    </PageShell>
  )
}

export default StockDashboard
