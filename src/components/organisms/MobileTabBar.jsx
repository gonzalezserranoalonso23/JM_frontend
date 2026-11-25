import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Ellipsis } from 'lucide-react'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from '@/components/atoms/dialog'
import { cn } from '@/lib/utils'
import {
  isNavPathActive,
  NAV_ICONS,
  tabGridClass
} from '@/components/organisms/navLinks'
import { prefetchRoute } from '@/auth/appRoutes'

const tabClass = (isActive) => {
  let tone = 'text-muted-foreground'
  if (isActive) {
    tone = 'rounded-lg bg-[#fff2f3] font-semibold text-primary dark:bg-transparent'
  }
  return cn(
    'relative flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1.5 text-xs font-medium',
    tone
  )
}

const sheetLinkClass = (isActive) => {
  let tone =
    'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
  if (isActive) tone = 'bg-accent text-primary'
  return cn(
    'flex min-h-11 min-w-0 items-center gap-3 rounded-lg px-3 text-base font-medium transition-colors',
    tone
  )
}

const sheetRowClass = (isActive) => {
  let tone =
    'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
  if (isActive) tone = 'bg-accent text-primary'
  return cn(
    'flex min-h-12 items-center justify-between gap-3 rounded-lg px-3 text-base font-medium transition-colors',
    tone
  )
}

const sheetIconClass = (isActive) =>
  cn(
    'flex size-8 shrink-0 items-center justify-center rounded-lg',
    isActive
      ? 'bg-[#ffe2e4] text-primary ring-1 ring-inset ring-primary/30 dark:bg-accent dark:text-primary dark:ring-0'
      : 'text-muted-foreground'
  )

const toggleGroup = (current, label) => {
  if (current === label) return null
  return label
}

const MoreLink = ({
  link,
  openGroup,
  setOpenGroup,
  pendingCount,
  onNavigate
}) => {
  if (link.children) {
    const groupOpen = openGroup === link.label
    const Icon = link.icon
    const groupTone = groupOpen
      ? 'bg-accent text-primary'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    return (
      <div>
        <button
          type="button"
          className={cn(
            'flex min-h-12 w-full min-w-0 items-center justify-between gap-3 rounded-lg px-3 text-base font-medium transition-colors',
            groupTone
          )}
          aria-expanded={groupOpen}
          onClick={() =>
            setOpenGroup((current) => toggleGroup(current, link.label))
          }
        >
          <span className="flex min-w-0 items-center gap-3">
            {Icon && (
              <span className={sheetIconClass(groupOpen)}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            )}
            <span className="truncate">{link.label}</span>
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 transition-transform',
              groupOpen && 'rotate-180 text-primary'
            )}
            aria-hidden="true"
          />
        </button>
        {groupOpen && (
          <div className="grid gap-1 pb-1 pl-3">
            {link.children.map(({ to, label, end }) => {
              const Icon = NAV_ICONS[to]
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  onPointerEnter={() => prefetchRoute(to)}
                  onFocus={() => prefetchRoute(to)}
                  className={({ isActive }) => sheetLinkClass(isActive)}
                >
                  {({ isActive }) => (
                    <>
                      <span className={sheetIconClass(isActive)}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="truncate">{label}</span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const Icon = NAV_ICONS[link.to]
  return (
    <NavLink
      to={link.to}
      end={link.end}
      onClick={onNavigate}
      onPointerEnter={() => prefetchRoute(link.to)}
      onFocus={() => prefetchRoute(link.to)}
      className={({ isActive }) => sheetRowClass(isActive)}
    >
      {({ isActive }) => (
        <>
          <span className="flex min-w-0 items-center gap-3">
            <span className={sheetIconClass(isActive)}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="truncate">{link.label}</span>
          </span>
          {link.badge && pendingCount > 0 && (
            <Badge variant="secondary">{pendingCount}</Badge>
          )}
        </>
      )}
    </NavLink>
  )
}

const MobileTabBar = ({
  links,
  primary,
  pendingCount,
  showNotifications,
  requestPermission,
  onLogout
}) => {
  const [moreOpen, setMoreOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState(null)
  const { pathname } = useLocation()
  const onPrimaryTab = primary.some((link) =>
    isNavPathActive(pathname, link.to, link.end)
  )
  const moreActive = !onPrimaryTab
  let moreTone = 'text-muted-foreground'
  if (moreOpen || moreActive) {
    moreTone =
      'rounded-lg bg-[#fff2f3] font-semibold text-primary dark:bg-transparent'
  }

  useEffect(() => {
    if (!moreOpen) return
    const current = links.find((link) =>
      link.children?.some((child) =>
        isNavPathActive(pathname, child.to, child.end)
      )
    )
    setOpenGroup(current?.label ?? null)
  }, [moreOpen, pathname, links])

  return (
    <>
      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent
          id="mobile-more-dialog"
          closeClassName="bg-transparent text-primary hover:bg-transparent focus-visible:bg-transparent"
          className="max-sm:pb-[max(1rem,var(--app-safe-bottom))]"
        >
          <DialogTitle className="sr-only">Más opciones</DialogTitle>
          <DialogDescription className="sr-only">
            Enlaces de navegación y acciones de la aplicación.
          </DialogDescription>
          <div
            aria-hidden="true"
            className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted"
          />
          <nav aria-label="Más opciones de navegación" className="grid min-w-0 gap-1">
            {links.map((link) => (
              <MoreLink
                key={link.to || link.label}
                link={link}
                openGroup={openGroup}
                setOpenGroup={setOpenGroup}
                pendingCount={pendingCount}
                onNavigate={() => setMoreOpen(false)}
              />
            ))}
          </nav>
          <div
            className={cn(
              'mt-3 grid gap-2',
              showNotifications ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
            )}
          >
            {showNotifications && (
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full"
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
              className="h-10 w-full"
              onClick={() => {
                setMoreOpen(false)
                onLogout()
              }}
            >
              Cerrar sesión
            </Button>
          </div>
        </DialogContent>
        <nav
          aria-label="Navegación inferior"
          className="app-tab-bar fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] backdrop-blur-md xl:hidden"
        >
          <div
            className={cn(
              'mx-auto grid h-[3.25rem] w-full px-1 sm:max-w-2xl sm:px-2',
              tabGridClass(primary.length, true)
            )}
          >
            {primary.map(({ to, label, end, badge }) => {
              const Icon = NAV_ICONS[to]
              const active = isNavPathActive(pathname, to, end)
              let countLabel = pendingCount
              if (pendingCount > 99) countLabel = '99+'
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMoreOpen(false)}
                  onPointerEnter={() => prefetchRoute(to)}
                  onFocus={() => prefetchRoute(to)}
                  className={tabClass(active)}
                >
                  <span
                    className={cn(
                      'relative flex h-6 w-6 items-center justify-center rounded-lg',
                      active &&
                        'bg-[#ffe2e4] text-primary ring-1 ring-inset ring-primary/30 dark:bg-accent dark:text-primary dark:ring-0'
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {badge && pendingCount > 0 && (
                      <span className="absolute -right-2 -top-1.5 z-10 min-w-4 rounded-full bg-destructive px-1 text-center text-[10px] leading-4 text-white">
                        {countLabel}
                      </span>
                    )}
                  </span>
                  <span className="w-full truncate text-center">{label}</span>
                </NavLink>
              )
            })}
            <DialogTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex min-h-11 flex-col items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium',
                  moreTone
                )}
                aria-controls="mobile-more-dialog"
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-lg',
                    (moreOpen || moreActive) &&
                      'bg-[#ffe2e4] text-primary ring-1 ring-inset ring-primary/30 dark:bg-accent dark:text-primary dark:ring-0'
                  )}
                >
                  <Ellipsis className="h-5 w-5" aria-hidden="true" />
                </span>
                Más
              </button>
            </DialogTrigger>
          </div>
        </nav>
      </Dialog>
    </>
  )
}

export default MobileTabBar
