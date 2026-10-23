import PageShell from '@/components/PageShell'
import { useAuthStore } from '@/store/auth'
import StockDashboard from './components/StockDashboard'
import ProductLookup from './components/ProductLookup'
import TodaySalesCard from './components/TodaySalesCard'

const Home = () => {
  const isAdmin = useAuthStore((state) => state.isAdmin)

  if (isAdmin) return <StockDashboard />

  return (
    <PageShell>
      <section className="mb-8" aria-labelledby="dashboard-title">
        <header className="mb-8">
          <h1
            id="dashboard-title"
            className="text-3xl font-bold text-foreground"
          >
            Inicio
          </h1>
          <p className="mt-2 text-muted-foreground">Consulta de productos</p>
        </header>
        <div className="flex flex-col gap-6 xl:grid xl:grid-cols-2 xl:items-start">
          <TodaySalesCard />
          <ProductLookup />
        </div>
      </section>
    </PageShell>
  )
}

export default Home
