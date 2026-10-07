import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navigate from '@/ui/Navigate'
import useTableCards from '@/hooks/useTableCards'

const PAGE_TITLES = {
  '/home': 'Inicio',
  '/entries': 'Entradas',
  '/issues': 'Salidas',
  '/orders': 'Órdenes',
  '/reports': 'Reportes',
  '/todolist': 'Tareas pendientes',
  '/catalogs': 'Catálogo',
  '/users': 'Usuarios',
  '/products': 'Productos',
  '/suppliers': 'Proveedores',
  '/categories': 'Categorías',
  '/daily-information': 'Información diaria',
  '/cash': 'Caja'
}

const DETAIL_PAGE_TITLES = {
  '/entries/': 'Detalle de entrada',
  '/issues/': 'Detalle de salida',
  '/orders/': 'Detalle de orden',
  '/reports/': 'Detalle de reporte',
  '/todolist/': 'Detalle de tarea',
  '/users/': 'Detalle de usuario',
  '/suppliers/': 'Detalle de proveedor'
}

const ProtectedLayout = () => {
  const { pathname } = useLocation()
  useTableCards()

  useEffect(() => {
    const pageTitle =
      PAGE_TITLES[pathname] ||
      Object.entries(DETAIL_PAGE_TITLES).find(([path]) =>
        pathname.startsWith(path)
      )?.[1] ||
      'Panel'

    document.title = `${pageTitle} | JM Panel`
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        `${pageTitle} del sistema de gestión de inventario de Mini Super JM.`
      )
  }, [pathname])

  return (
    <>
      <Navigate />
      <main className="min-h-dvh bg-[var(--bg-page)] pt-[var(--app-nav-height)]">
        <Outlet />
      </main>
    </>
  )
}

export default ProtectedLayout
