import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import { useGetPendingTasks } from '@/features/tasks.features'

const Navigate = () => {
  const logOut = useAuthStore((state) => state.logOut)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const { data: pendingTasks } = useGetPendingTasks()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const pendingCount = pendingTasks?.length ?? 0

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const handleLogOut = () => {
    logOut()
    toast.success('Cierre de sesión exitoso!')
    navigate('/')
  }

  const links = [
    { to: '../home', label: 'Inicio', end: true },
    { to: '../issues', label: 'Salidas' },
    { to: '../entries', label: 'Entradas' },
    { to: '../orders', label: 'Órdenes' },
    { to: '../todolist', label: 'Pendientes', badge: pendingCount },
    { to: '../reports', label: 'Reportes' },
    { to: '../daily-information', label: 'Información diaria' },
    { to: '../cash', label: 'Caja' },
    ...(isAdmin ? [{ to: '../catalogs', label: 'Catálogo' }] : [])
  ]

  return (
    <nav
      aria-label="Navegación principal"
      className="app-nav fixed left-0 right-0 top-0 z-50 border-b border-gray-800 bg-black text-gray-300 shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            to="../home"
            className="flex shrink-0 items-center rounded-sm text-lg font-bold text-gray-100 transition-colors hover:text-white focus-visible:outline-white"
          >
            JM Panel
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-200 transition-colors hover:bg-gray-800 hover:text-white focus-visible:outline-white xl:hidden"
            aria-expanded={isOpen}
            aria-controls="app-navigation-menu"
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          <div className="hidden min-w-0 items-center gap-1 xl:flex">
            <div className="flex min-w-0 items-center gap-1">
              {links.map(({ to, label, end, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-lg px-2.5 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-white ${
                      isActive ? 'bg-white/10 text-white' : 'text-gray-300'
                    }`
                  }
                >
                  {label}
                  {badge !== undefined && (
                    <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs font-semibold text-white">
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
            <button
              type="button"
              onClick={handleLogOut}
              className="ml-2 min-h-10 shrink-0 rounded-lg bg-gray-100 px-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-white focus-visible:outline-white"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {isOpen && (
          <div
            id="app-navigation-menu"
            className="max-h-[calc(var(--app-vh,1svh)*100-var(--app-nav-height))] space-y-1 overflow-y-auto overscroll-contain border-t border-gray-800 pb-4 pt-3 xl:hidden"
          >
            <div>
              {links.map(({ to, label, end, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex min-h-12 items-center justify-between rounded-lg px-4 text-sm font-medium transition-colors hover:bg-gray-800 hover:text-white focus-visible:outline-white ${
                      isActive ? 'bg-white/10 text-white' : 'text-gray-300'
                    }`
                  }
                >
                  {label}
                  {badge !== undefined && (
                    <span className="rounded-full bg-gray-700 px-2.5 py-1 text-xs font-semibold text-white">
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
            <button
              type="button"
              onClick={handleLogOut}
              className="mt-2 min-h-12 w-full rounded-lg bg-gray-100 px-4 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-white focus-visible:outline-white"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigate
