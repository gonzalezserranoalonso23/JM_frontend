import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import { useGetCurrentUser } from '@/features/users.features'
import { useGetPendingTasks } from '@/features/tasks.features'
import { hasFullAccess, sessionRole } from '@/auth/access'
import { logout } from '@/services/users.services'
import useTaskNotifications from '@/hooks/useTaskNotifications'
import MobileTabBar from '@/components/organisms/MobileTabBar'
import {
  desktopLinkAlignment,
  getNavLinks,
  isNavPathActive,
  NAV_ICONS,
  splitMobileTabs
} from '@/components/organisms/navLinks'
import {
  AdminLogoutButton,
  StaffLogoutButton
} from '@/components/molecules/LogoutButton'
import { prefetchRoute, prefetchRoutes } from '@/auth/appRoutes'
import ProductLookup from '@/pages/home/components/ProductLookup'
import AccountProfile from '@/components/organisms/AccountProfile'

const navItemClass = (active) => {
  let tone =
    'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
  if (active) {
    tone =
      "font-semibold text-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary after:content-['']"
  }
  return cn(
    'relative inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 2xl:px-2.5',
    tone
  )
}

const menuItemClass = (isActive) => {
  let tone = 'text-foreground hover:bg-accent hover:text-accent-foreground'
  if (isActive) tone = 'font-semibold text-primary'
  return cn(
    'flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium',
    tone
  )
}

const NavGroup = ({ label, items, icon: Icon }) => {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState(null)
  const menuId = useId()
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
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
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
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
        <span>{label}</span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open && menuPos && (
        <div
          id={menuId}
          style={{ top: menuPos.top, left: menuPos.left }}
          className="fixed z-[60] min-w-40 rounded-md border bg-background p-1 shadow-md"
        >
          {items.map(({ to, label: childLabel, end }) => {
            const ItemIcon = NAV_ICONS[to]
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => menuItemClass(isActive)}
                onPointerEnter={() => prefetchRoute(to)}
                onFocus={() => prefetchRoute(to)}
              >
                <ItemIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{childLabel}</span>
              </NavLink>
            )
          })}
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
    return (
      <NavGroup label={link.label} items={link.children} icon={link.icon} />
    )
  }

  const Icon = NAV_ICONS[link.to]

  return (
    <NavLink
      to={link.to}
      end={link.end}
      className={({ isActive }) => navItemClass(isActive)}
      onPointerEnter={() => prefetchRoute(link.to)}
      onFocus={() => prefetchRoute(link.to)}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{link.label}</span>
      {link.badge && pendingCount > 0 && (
        <Badge variant="secondary" className="pointer-events-none px-1.5">
          {pendingCount}
        </Badge>
      )}
    </NavLink>
  )
}

const Navigate = () => {
  const { pathname } = useLocation()
  const logOut = useAuthStore((state) => state.logOut)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const { data: me } = useGetCurrentUser()
  const { tasks: pendingTasks, total: pendingCount } = useGetPendingTasks()
  const { showNotifications, requestPermission } =
    useTaskNotifications(pendingTasks)
  const navigate = useNavigate()
  const admin = sessionRole(isAdmin, me)
  const fullAccess = hasFullAccess(admin)
  const links = getNavLinks(admin, me?.haveSchedule)
  const notifyInHeader = showNotifications
  const { primary, moreLinks } = splitMobileTabs(links, admin)
  const Logout = fullAccess ? AdminLogoutButton : StaffLogoutButton

  useEffect(() => {
    const paths = getNavLinks(admin, me?.haveSchedule).flatMap((link) =>
      link.children ? link.children.map((child) => child.to) : [link.to]
    )
    prefetchRoutes(paths)
  }, [admin, me?.haveSchedule])

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
          <div
            className={cn(
              'mx-auto w-full max-w-[1760px] px-3 sm:px-6 xl:px-8'
            )}
          >
            <div className="flex h-14 min-w-0 items-center gap-2 xl:h-16 xl:gap-3">
              <Link
                to="/home"
                className="flex shrink-0 items-center gap-2.5 rounded-sm text-lg font-bold text-foreground"
              >
                <img
                  src="/logo.svg"
                  alt=""
                  width="44"
                  height="44"
                  className="app-brand-logo h-11 w-11 shrink-0 rounded-md"
                />
                <span
                  className="sr-only 2xl:not-sr-only 2xl:inline"
                >
                  JM Panel
                </span>
              </Link>

              <div
                className={cn(
                  'hidden min-w-0 flex-1 items-center gap-1 overflow-visible xl:flex',
                  desktopLinkAlignment(admin)
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
                <AccountProfile />
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
