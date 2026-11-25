import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navigate from '@/components/organisms/Navigate'
import ListSkeleton from '@/components/molecules/ListSkeleton'
import PageShell from '@/components/templates/PageShell'
import RouteErrorBoundary from '@/components/templates/RouteErrorBoundary'

const PAGE_TITLES = {
  '/home': 'Inicio',
  '/entries': 'Entradas',
  '/issues': 'Salidas',
  '/reports': 'Ventas',
  '/low-stock': 'Bajo stock',
  '/todolist': 'Pendientes',
  '/attendance': 'Asistencias',
  '/catalogs': 'Catálogo',
  '/users': 'Usuarios',
  '/products': 'Productos',
  '/suppliers': 'Proveedores',
  '/cash': 'Caja',
  '/categories': 'Categorías',
  '/payment-types': 'Métodos de pago',
  '/daily-information': 'Información',
  '/cash': 'Caja'
}

const DETAIL_PAGE_TITLES = {
  '/entries/': 'Detalle de entrada',
  '/issues/': 'Detalle de salida',
  '/reports/': 'Detalle de reporte',
  '/todolist/': 'Detalle de pendiente',
  '/users/': 'Detalle de usuario',
  '/suppliers/': 'Detalle de proveedor'
}

const ProtectedLayout = () => {
  const { pathname } = useLocation()
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    const pageTitle =
      PAGE_TITLES[pathname] ||
      Object.entries(DETAIL_PAGE_TITLES).find(([path]) =>
        pathname.startsWith(path)
      )?.[1] ||
      'Panel'

    document.title = `${pageTitle} | JM Panel`
    setAnnouncement(`Página ${pageTitle}`)
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        `${pageTitle} del sistema de gestión de inventario de Mini Super JM.`
      )
  }, [pathname])

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-[var(--app-nav-height)] z-[100] rounded-md bg-background px-4 py-3 text-foreground shadow-lg focus:not-sr-only focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        Saltar al contenido principal
      </a>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      <Navigate />
      <main
        id="main-content"
        tabIndex="-1"
        className="app-page-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain pt-[var(--app-nav-height)] pb-[var(--app-tab-height)] [-webkit-overflow-scrolling:touch] focus:outline-none"
      >
        <RouteErrorBoundary resetKey={pathname}>
          <Suspense
            fallback={
              <PageShell>
                <ListSkeleton />
              </PageShell>
            }
          >
            <Outlet />
          </Suspense>
        </RouteErrorBoundary>
      </main>
    </div>
  )
}

export default ProtectedLayout
