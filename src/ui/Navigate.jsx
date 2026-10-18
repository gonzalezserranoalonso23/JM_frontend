import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import { useGetPendingTasks } from '@/features/tasks.features'
import { logout } from '@/services/users.services'
import useTaskNotifications from '@/hooks/useTaskNotifications'

const Navigate = () => {
  const logOut = useAuthStore((state) => state.logOut)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const { data: pendingTasks } = useGetPendingTasks()
  const { permission, requestPermission } = useTaskNotifications(pendingTasks)
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const pendingCount = pendingTasks?.length ?? 0

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const handleLogOut = async () => {
    // Invalida el token en el servidor; si falla, igual se cierra localmente
    await logout().catch(() => {})
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
    { to: '../reports', label: 'Reportes', adminOnly: true },
    {
      to: '../daily-information',
      label: 'Información diaria',
      adminOnly: true
    },
    { to: '../shortages', label: 'Faltantes' },
    { to: '../cash', label: 'Caja' },
    { to: '../catalogs', label: 'Catálogo', adminOnly: true }
  ].filter((link) => isAdmin || !link.adminOnly)

  return (
    <nav
      aria-label="Navegación principal"
      className="app-nav fixed left-0 right-0 top-0 z-50 border-b border-border bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-[1760px] px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            to="../home"
            className="flex shrink-0 items-center gap-2.5 rounded-sm text-lg font-bold text-foreground"
          >
            <img
              src="/logo.svg"
              alt=""
              width="32"
              height="32"
              className="h-8 w-8 rounded-md"
            />
            JM Panel
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen((open) => !open)}
            className="xl:hidden"
            aria-expanded={isOpen}
            aria-controls="app-navigation-menu"
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>

          <div className="hidden min-w-0 items-center gap-1 xl:flex">
            <div className="flex min-w-0 items-center gap-1">
              {links.map(({ to, label, end, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-md px-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground'
                    )
                  }
                >
                  {label}
                  {badge !== undefined && (
                    <Badge variant="secondary">{badge}</Badge>
                  )}
                </NavLink>
              ))}
            </div>
            {permission === 'default' && (
              <Button
                type="button"
                variant="outline"
                onClick={requestPermission}
                className="ml-2 shrink-0"
              >
                Activar notificaciones
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleLogOut}
              className="ml-2 shrink-0"
            >
              Cerrar sesión
            </Button>
          </div>
        </div>

        {isOpen && (
          <div
            id="app-navigation-menu"
            className="max-h-[calc(var(--app-vh,1svh)*100-var(--app-nav-height))] space-y-0.5 overflow-y-auto overscroll-contain border-t border-border pb-2 pt-2 xl:hidden"
          >
            <div>
              {links.map(({ to, label, end, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-10 items-center justify-between rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground'
                    )
                  }
                >
                  {label}
                  {badge !== undefined && (
                    <Badge variant="secondary">{badge}</Badge>
                  )}
                </NavLink>
              ))}
            </div>
            {permission === 'default' && (
              <Button
                type="button"
                variant="outline"
                onClick={requestPermission}
                className="mt-1 w-full justify-start"
              >
                Activar notificaciones
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              onClick={handleLogOut}
              className="ml-auto mt-1 block"
            >
              Cerrar sesión
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigate
