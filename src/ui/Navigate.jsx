import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import { useGetPendingTasks } from '@/features/tasks.features'
import { logout } from '@/services/users.services'
import useTaskNotifications from '@/hooks/useTaskNotifications'
import MobileTabBar from '@/ui/MobileTabBar'
import { getNavLinks, isNavPathActive } from '@/ui/navLinks'
import ProductLookup from '@/pages/home/components/ProductLookup'
import AccountProfile from '@/ui/AccountProfile'

const navItemClass = (active) =>
  cn(
    'relative inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-md px-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
    active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
  )

const NavGroup = ({ label, children }) => {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const menuRef = useRef(null)
  const active = children.some((child) =>
    isNavPathActive(pathname, child.to, child.end)
  )

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const closeOnOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className={navItemClass(active || open)}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={label}
          className="absolute left-0 top-full z-50 mt-1 min-w-40 rounded-md border bg-background p-1 shadow-md"
        >
          {children.map(({ to, label: childLabel, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              role="menuitem"
              className={({ isActive }) =>
                cn(
                  'flex min-h-10 items-center rounded-md px-3 text-sm font-medium',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              {childLabel}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

const Navigate = () => {
  const logOut = useAuthStore((state) => state.logOut)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const { data: pendingTasks } = useGetPendingTasks()
  const { showNotifications, requestPermission } =
    useTaskNotifications(pendingTasks)
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
      <header>
        <nav
          aria-label="Navegación principal"
          className="app-nav fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/95 text-foreground backdrop-blur-md"
        >
          <div className="mx-auto w-full max-w-[1760px] px-3 sm:px-6 xl:px-8">
            <div className="flex h-14 items-center justify-between gap-2 xl:h-16 xl:gap-4">
              <Link
                to="/home"
                className="flex min-w-0 items-center gap-2.5 rounded-sm text-lg font-bold text-foreground"
              >
                <img
                  src="/logo.svg"
                  alt=""
                  width="32"
                  height="32"
                  className="h-8 w-8 shrink-0 rounded-md"
                />
                <span className="truncate">JM Panel</span>
              </Link>

              <div className="flex shrink-0 items-center gap-1">
                <ProductLookup />
                <AccountProfile />
                <div className="hidden min-w-0 items-center gap-1 xl:flex">
                  <div className="flex min-w-0 items-center gap-1">
                    {links.map((link) =>
                      link.children ? (
                        <NavGroup
                          key={link.label}
                          label={link.label}
                          children={link.children}
                        />
                      ) : (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          end={link.end}
                          className={({ isActive }) => navItemClass(isActive)}
                        >
                          {link.label}
                          {link.badge && pendingCount > 0 && (
                            <Badge
                              variant="secondary"
                              className="pointer-events-none px-1.5"
                            >
                              {pendingCount}
                            </Badge>
                          )}
                        </NavLink>
                      )
                    )}
                  </div>
                  {showNotifications && (
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
          </div>
        </nav>
      </header>
      <MobileTabBar
        links={links}
        pendingCount={pendingCount}
        showNotifications={showNotifications}
        requestPermission={requestPermission}
        onLogout={handleLogOut}
      />
    </>
  )
}

export default Navigate
