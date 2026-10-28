import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Home,
  ListTodo,
  Ellipsis
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PRIMARY_TABS } from '@/ui/navLinks'

const TAB_ICONS = {
  '/home': Home,
  '/issues': ArrowUpFromLine,
  '/entries': ArrowDownToLine,
  '/todolist': ListTodo
}

const MobileTabBar = ({
  links,
  pendingCount,
  showNotifications,
  requestPermission,
  onLogout
}) => {
  const [moreOpen, setMoreOpen] = useState(false)
  const { pathname } = useLocation()
  const primary = links.filter((link) => PRIMARY_TABS.includes(link.to))
  const moreLinks = links.filter((link) => !PRIMARY_TABS.includes(link.to))
  const onPrimaryTab = PRIMARY_TABS.some((tab) =>
    tab === '/home'
      ? pathname === '/home'
      : pathname === tab || pathname.startsWith(`${tab}/`)
  )
  const moreActive = !onPrimaryTab

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Cerrar menú"
            onClick={() => setMoreOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Más opciones"
            className="absolute inset-x-0 bottom-[var(--app-tab-height)] max-h-[calc(100dvh-var(--app-tab-height)-env(safe-area-inset-top,0px))] overflow-y-auto rounded-t-2xl border-t bg-background p-4 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] shadow-lg"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />
            <nav className="grid gap-1">
              {moreLinks.map(({ to, label, end, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-12 items-center justify-between rounded-lg px-3 text-base font-medium',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground'
                    )
                  }
                >
                  {label}
                  {badge && pendingCount > 0 && (
                    <Badge variant="secondary">{pendingCount}</Badge>
                  )}
                </NavLink>
              ))}
            </nav>
            {showNotifications && (
              <Button
                type="button"
                variant="outline"
                className="mt-3 h-12 w-full"
                onClick={() => {
                  requestPermission()
                  setMoreOpen(false)
                }}
              >
                Activar notificaciones
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              className="mt-2 h-12 w-full"
              onClick={() => {
                setMoreOpen(false)
                onLogout()
              }}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      )}

      <nav
        aria-label="Navegación inferior"
        className="app-tab-bar fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] backdrop-blur-md xl:hidden"
      >
        <div className="grid h-[3.25rem] grid-cols-5 px-1">
          {primary.map(({ to, label, end, badge }) => {
            const Icon = TAB_ICONS[to]
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMoreOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'relative flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1.5 text-[11px] font-medium',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )
                }
              >
                <span className="relative">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {badge && pendingCount > 0 && (
                    <span className="absolute -right-2 -top-1.5 z-10 min-w-4 rounded-full bg-destructive px-1 text-center text-[10px] leading-4 text-white">
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                  )}
                </span>
                <span className="w-full truncate text-center">{label}</span>
              </NavLink>
            )
          })}
          <button
            type="button"
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium',
              moreOpen || moreActive
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((open) => !open)}
          >
            <Ellipsis className="h-5 w-5" aria-hidden="true" />
            Más
          </button>
        </div>
      </nav>
    </>
  )
}

export default MobileTabBar
