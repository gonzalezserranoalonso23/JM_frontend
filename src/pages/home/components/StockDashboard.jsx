import { formatCurrency } from '@/utils/commonFunctions'
import PageShell from '@/components/templates/PageShell'
import { useGetInventoryStats } from '@/features/inventory.features'
import TodaySalesCard from './TodaySalesCard'
import DailyInformationDashboard from './DailyInformationDashboard'
import { Alert, AlertDescription } from '@/components/atoms/alert'
import { Card } from '@/components/atoms/card'
import Skeleton from '@/components/atoms/skeleton'

const KPIS = (stats) => [
  ['Productos', stats?.totalProducts || 0],
  ['Dinero en stock', formatCurrency(stats?.totalInventoryValue || 0)]
]

const StockDashboard = () => {
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError
  } = useGetInventoryStats()

  const kpis = KPIS(stats)

  return (
    <PageShell>
      <section className="mb-8" aria-labelledby="dashboard-title">
        <header className="mb-6">
          <h1
            id="dashboard-title"
            className="text-2xl font-bold text-foreground sm:text-3xl"
          >
            Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">Resumen del sistema</p>
        </header>

        <div className="mb-6">
          <TodaySalesCard />
        </div>

        <DailyInformationDashboard />

        {statsError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              No se pudo conectar con el servidor.
            </AlertDescription>
          </Alert>
        )}

        <section
          className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4"
          aria-label="Indicadores de inventario"
        >
          {kpis.map(([label, value]) => (
            <Card key={label} className="h-full gap-2 p-4 sm:p-6">
              <h2 className="text-sm font-medium text-muted-foreground">
                {label}
              </h2>
              <p className="text-3xl font-bold text-foreground">
                {statsLoading ? <Skeleton className="h-9 w-36" /> : value}
              </p>
            </Card>
          ))}
        </section>
      </section>
    </PageShell>
  )
}

export default StockDashboard
