import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navigate from './Navigate'
import { getNavLinks } from './navLinks'

const auth = vi.hoisted(() => ({
  haveSchedule: true,
  isAdmin: true
}))
const notifications = vi.hoisted(() => ({
  showNotifications: false,
  requestPermission: vi.fn()
}))

vi.mock('@/store/auth', () => ({
  useAuthStore: (selector) =>
    selector({
      logOut: vi.fn(),
      isAdmin: auth.isAdmin
    })
}))

vi.mock('@/features/tasks.features', () => ({
  useGetPendingTasks: () => ({ data: [] })
}))

vi.mock('@/features/users.features', () => ({
  useGetCurrentUser: () => ({
    data: {
      haveSchedule: auth.haveSchedule,
      isAdmin: auth.isAdmin
    }
  })
}))

vi.mock('@/hooks/useTaskNotifications', () => ({
  default: () => notifications
}))

vi.mock('@/services/users.services', () => ({
  logout: vi.fn()
}))

vi.mock('@/pages/home/components/ProductLookup', () => ({
  default: () => null
}))

vi.mock('@/components/organisms/AccountProfile', () => ({
  default: () => null
}))

const renderNav = (initialPath = '/home') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navigate />
    </MemoryRouter>
  )

describe('Navigate de administrador', () => {
  afterEach(() => {
    cleanup()
    auth.haveSchedule = true
    auth.isAdmin = true
    notifications.showNotifications = false
  })

  it('muestra el nombre accesible de la aplicación', () => {
    renderNav('/daily-information')

    expect(
      screen.getByRole('link', { name: 'JM Panel' })
    ).toBeInTheDocument()
  })

  it('muestra la navegación administrativa en el orden definido', () => {
    const labels = getNavLinks(true).map((link) => link.label)

    expect(labels).toEqual([
      'Inicio',
      'Pendientes',
      'Información',
      'Productos',
      'Proveedores',
      'Caja',
      'Usuarios',
      'Reportes'
    ])
  })

  it('muestra iconos en los enlaces de escritorio y el menú Reportes', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderNav()

    const navigation = screen.getByRole('navigation', {
      name: 'Navegación principal'
    })
    expect(
      within(navigation)
        .getByRole('link', { name: 'Productos' })
        .querySelector('svg')
    ).toBeInTheDocument()

    const reportsButton = within(navigation).getByRole('button', {
      name: 'Reportes'
    })
    expect(reportsButton.querySelector('svg')).toBeInTheDocument()
    await user.click(reportsButton)
    expect(
      screen.getByRole('link', { name: 'Ventas' }).querySelector('svg')
    ).toBeInTheDocument()
  })

  it('muestra iconos en las opciones del menú móvil', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderNav()

    await user.click(screen.getByRole('button', { name: 'Más' }))
    const moreMenu = screen.getByRole('dialog', { name: 'Más opciones' })
    const reportsButton = within(moreMenu).getByRole('button', {
      name: 'Reportes'
    })
    expect(reportsButton.querySelector('svg')).toBeInTheDocument()
    await user.click(reportsButton)
    expect(within(moreMenu).getByRole('link', { name: 'Ventas' })).toBeTruthy()
  })

  it('Reportes abre Ventas y Asistencias', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderNav()

    expect(screen.queryByRole('link', { name: 'Asistencias' })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Reportes' }))

    expect(screen.getByRole('link', { name: 'Ventas' })).toHaveAttribute(
      'href',
      '/reports'
    )
    expect(
      screen.getByRole('link', { name: 'Asistencias' })
    ).toHaveAttribute('href', '/attendance')
    expect(screen.queryByRole('link', { name: 'Bajo stock' })).toBeNull()
  })

  it('Reportes sigue mostrando Asistencias aunque no haya horario', async () => {
    auth.haveSchedule = false
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderNav()

    await user.click(screen.getByRole('button', { name: 'Reportes' }))

    expect(screen.getByRole('link', { name: 'Ventas' })).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Asistencias' })
    ).toHaveAttribute('href', '/attendance')
    expect(screen.queryByRole('link', { name: 'Bajo stock' })).toBeNull()
  })

  it('cierra el diálogo móvil con Escape y devuelve el foco al activador', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderNav()

    const trigger = screen.getByRole('button', { name: 'Más' })
    await user.click(trigger)
    expect(screen.getByRole('dialog', { name: 'Más opciones' })).toBeVisible()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog', { name: 'Más opciones' })).toBeNull()
    expect(trigger).toHaveFocus()
  })

  it('staff ve sus opciones permitidas sin entradas ni salidas', () => {
    auth.isAdmin = false
    renderNav()

    expect(screen.queryByRole('button', { name: 'Reportes' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Catálogo' })).toBeNull()
    expect(screen.getAllByRole('link', { name: 'Inicio' })[0]).toHaveAttribute(
      'href',
      '/home'
    )
    expect(screen.queryByRole('link', { name: 'Salidas' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Entradas' })).toBeNull()
    expect(
      screen.getAllByRole('link', { name: 'Productos' })[0]
    ).toHaveAttribute('href', '/products')
    expect(
      screen.getAllByRole('link', { name: 'Proveedores' })[0]
    ).toHaveAttribute('href', '/suppliers')
    expect(
      screen.getAllByRole('link', { name: 'Asistencias' })[0]
    ).toHaveAttribute('href', '/attendance')
  })

  it('oculta Asistencias a Staff sin horario', () => {
    auth.isAdmin = false
    auth.haveSchedule = false
    renderNav()

    expect(screen.queryByRole('link', { name: 'Asistencias' })).toBeNull()
  })
})
