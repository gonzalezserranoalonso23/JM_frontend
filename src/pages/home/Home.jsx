import { useAuthStore } from '@/store/auth'
import StockDashboard from './components/StockDashboard'
import ProductLookup from './components/ProductLookup'

const Home = () => {
  const isAdmin = useAuthStore((state) => state.isAdmin)

  if (isAdmin) return <StockDashboard />

  return (
    <div className="bg-background">
      <div className="page-content-shell">
        <section className="mt-6 mb-8" aria-labelledby="dashboard-title">
          <header className="mb-8">
            <h1
              id="dashboard-title"
              className="text-3xl font-bold text-foreground"
            >
              Inicio
            </h1>
            <p className="text-muted-foreground mt-2">Consulta de productos</p>
          </header>
          <ProductLookup />
        </section>
      </div>
    </div>
  )
}

export default Home
