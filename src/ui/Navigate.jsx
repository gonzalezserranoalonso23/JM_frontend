import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import { useGetPendingTasks } from '@/features/tasks.features'
import { logout } from '@/services/users.services'
import useTaskNotifications from '@/hooks/useTaskNotifications'
import MobileTabBar from '@/ui/MobileTabBar'
import { getNavLinks } from '@/ui/navLinks'

const Navigate = () => {
  const logOut = useAuthStore((state) => state.logOut)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const { data: pendingTasks } = useGetPendingTasks()
  const { permission, requestPermission } = useTaskNotifications()
  const navigate = useNavigate()
  const pendingCount = pendingTasks?.length ?? 0
  const links = getNavLinks(isAdmin)

  const handleLogOut = async () => {
    await logout().catch(() => {})
    logOut()
    toast.success('Cierre de sesión exitoso!')
    navigate('/')
  }

  return (
    <>
      <nav
        aria-label="Navegación principal"
        className="app-nav fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/95 text-foreground backdrop-blur-md"
      >
        <div className="mx-auto w-full max-w-[1760px] px-3 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4 xl:h-16">
            <Link
              to="/home"
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
                    {badge && pendingCount > 0 && (
                      <Badge variant="secondary">{pendingCount}</Badge>
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
        </div>
      </nav>
      <MobileTabBar
        links={links}
        pendingCount={pendingCount}
        permission={permission}
        requestPermission={requestPermission}
        onLogout={handleLogOut}
      />
    </>
  )
}

export default Navigate
