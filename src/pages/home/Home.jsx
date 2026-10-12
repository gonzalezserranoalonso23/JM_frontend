import { useAuthStore } from '@/store/auth'
import StockDashboard from './components/StockDashboard'
import ProductLookup from './components/ProductLookup'

const Home = () => {
  const isAdmin = useAuthStore((state) => state.isAdmin)

  if (isAdmin) return <StockDashboard />

  return (
    <div className="bg-[var(--bg-page)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 page-content-shell">
        <section
          className="dashboard-shell home-dashboard-shell mt-6 mb-8"
          aria-labelledby="dashboard-title"
        >
          <header className="mb-8">
            <h1
              id="dashboard-title"
              className="text-3xl font-bold text-slate-900"
            >
              Inicio
            </h1>
            <p className="text-slate-500 mt-2">Consulta de productos</p>
          </header>
          <ProductLookup />
        </section>
      </div>
    </div>
  )
}

export default Home
