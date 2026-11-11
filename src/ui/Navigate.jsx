import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import { useGetCurrentUser } from '@/features/users.features'
import { useGetPendingTasks } from '@/features/tasks.features'
import { hasFullAccess, sessionRole } from '@/auth/access'
import { logout } from '@/services/users.services'
import useTaskNotifications from '@/hooks/useTaskNotifications'
import MobileTabBar from '@/ui/MobileTabBar'
import {
  desktopLinkAlignment,
  getNavLinks,
  isNavPathActive,
  splitMobileTabs
} from '@/ui/navLinks'
import { AdminLogoutButton, StaffLogoutButton } from '@/ui/LogoutButton'
import { prefetchRoute, prefetchRoutes } from '@/auth/appRoutes'
import ProductLookup from '@/pages/home/components/ProductLookup'
import AccountProfile from '@/ui/AccountProfile'

const navItemClass = (active) => {
  let tone = 'text-muted-foreground'
  if (active) tone = 'bg-accent text-accent-foreground'
  return cn(
    'relative inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 2xl:px-2.5',
    tone
  )
}

const menuItemClass = (isActive) => {
  let tone = 'text-foreground hover:bg-accent hover:text-accent-foreground'
  if (isActive) tone = 'bg-accent text-accent-foreground'
  return cn(
    'flex min-h-10 items-center rounded-md px-3 text-sm font-medium',
    tone
  )
}

const NavGroup = ({ label, items }) => {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState(null)
  const { pathname } = useLocation()
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const active = items.some((child) =>
    isNavPathActive(pathname, child.to, child.end)
  )

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return undefined
    const place = () => {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      setMenuPos({ top: rect.bottom + 4, left: rect.left })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
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
        ref={buttonRef}
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
      {open && menuPos && (
        <div
          role="menu"
          aria-label={label}
          style={{ top: menuPos.top, left: menuPos.left }}
          className="fixed z-[60] min-w-40 rounded-md border bg-background p-1 shadow-md"
        >
          {items.map(({ to, label: childLabel, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              role="menuitem"
              className={({ isActive }) => menuItemClass(isActive)}
              onPointerEnter={() => prefetchRoute(to)}
              onFocus={() => prefetchRoute(to)}
            >
              {childLabel}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

const NotifyButton = ({ show, onRequest }) => {
  if (!show) return null
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="shrink-0 2xl:hidden"
        aria-label="Activar notificaciones"
        onClick={onRequest}
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onRequest}
        className="hidden shrink-0 2xl:inline-flex"
      >
        Activar notificaciones
      </Button>
    </>
  )
}

const DesktopLink = ({ link, pendingCount }) => {
  if (link.children) {
    return <NavGroup label={link.label} items={link.children} />
  }

  return (
    <NavLink
      to={link.to}
      end={link.end}
      className={({ isActive }) => navItemClass(isActive)}
      onPointerEnter={() => prefetchRoute(link.to)}
      onFocus={() => prefetchRoute(link.to)}
    >
      {link.label}
      {link.badge && pendingCount > 0 && (
        <Badge variant="secondary" className="pointer-events-none px-1.5">
          {pendingCount}
        </Badge>
      )}
    </NavLink>
  )
}

const Navigate = () => {
  const logOut = useAuthStore((state) => state.logOut)
  const role = useAuthStore((state) => state.role)
  const { data: me } = useGetCurrentUser()
  const { data: pendingTasks } = useGetPendingTasks()
  const { showNotifications, requestPermission } =
    useTaskNotifications(pendingTasks)
  const navigate = useNavigate()
  const pendingCount = pendingTasks?.length ?? 0
  const roleName = sessionRole(role, me)
  const fullAccess = hasFullAccess(roleName)
  const links = getNavLinks(roleName)
  let notifyInHeader = showNotifications
  let accountNotifications = null
  if (roleName === 'User') {
    notifyInHeader = false
    accountNotifications = {
      show: showNotifications,
      request: requestPermission
    }
  }
  const { primary, moreLinks } = splitMobileTabs(links, roleName)
  const Logout = fullAccess ? AdminLogoutButton : StaffLogoutButton

  useEffect(() => {
    const paths = getNavLinks(roleName).flatMap((link) =>
      link.children ? link.children.map((child) => child.to) : [link.to]
    )
    prefetchRoutes(paths)
  }, [roleName])

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
            <div className="flex h-14 min-w-0 items-center gap-2 xl:h-16 xl:gap-3">
              <Link
                to="/home"
                className="flex shrink-0 items-center gap-2.5 rounded-sm text-lg font-bold text-foreground"
              >
                <img
                  src="/logo.svg"
                  alt=""
                  width="32"
                  height="32"
                  className="h-8 w-8 shrink-0 rounded-md"
                />
                <span className="sr-only truncate 2xl:not-sr-only 2xl:inline">
                  JM Panel
                </span>
              </Link>

              <div
                className={cn(
                  'hidden min-w-0 flex-1 items-center gap-1 overflow-visible xl:flex',
                  desktopLinkAlignment(roleName)
                )}
              >
                {links.map((link) => (
                  <DesktopLink
                    key={link.to || link.label}
                    link={link}
                    pendingCount={pendingCount}
                  />
                ))}
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-1">
                <ProductLookup />
                <AccountProfile notifications={accountNotifications} />
                <Logout onLogout={handleLogOut} />
                <NotifyButton
                  show={notifyInHeader}
                  onRequest={requestPermission}
                />
              </div>
            </div>
          </div>
        </nav>
      </header>
      <MobileTabBar
        links={moreLinks}
        primary={primary}
        pendingCount={pendingCount}
        showNotifications={notifyInHeader}
        requestPermission={requestPermission}
        onLogout={handleLogOut}
      />
    </>
  )
}

export default Navigate
