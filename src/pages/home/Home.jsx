import PageShell from '@/components/PageShell'
import { useAuthStore } from '@/store/auth'
import StockDashboard from './components/StockDashboard'
import ProductLookup from './components/ProductLookup'

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
        <ProductLookup />
      </section>
    </PageShell>
  )
}

export default Home
