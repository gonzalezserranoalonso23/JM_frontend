import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navigate from './Navigate'
import { getNavLinks } from './navLinks'

const auth = vi.hoisted(() => ({
  haveSchedule: true,
  roleName: 'Manager'
}))
const notifications = vi.hoisted(() => ({
  showNotifications: false,
  requestPermission: vi.fn()
}))

vi.mock('@/store/auth', () => ({
  useAuthStore: (selector) =>
    selector({
      logOut: vi.fn(),
      role: auth.roleName
    })
}))

vi.mock('@/features/tasks.features', () => ({
  useGetPendingTasks: () => ({ data: [] })
}))

vi.mock('@/features/users.features', () => ({
  useGetCurrentUser: () => ({
    data: {
      haveSchedule: auth.haveSchedule,
      role: { name: auth.roleName }
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
    auth.roleName = 'Manager'
    notifications.showNotifications = false
  })

  it('oculta el texto de marca en Caja pero conserva su nombre accesible', () => {
    renderNav('/cash')

    expect(
      screen.getByRole('link', { name: 'JM Cash-out' })
    ).toBeInTheDocument()
    expect(screen.getByText('JM Cash-out')).toHaveClass('sr-only')
  })

  it('muestra Reportes entre Caja y Catálogo', () => {
    const labels = getNavLinks('Manager').map((link) => link.label)
    const cashIndex = labels.indexOf('Caja')

    expect(labels.slice(cashIndex, cashIndex + 3)).toEqual([
      'Caja',
      'Reportes',
      'Catálogo'
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
        .getByRole('link', { name: 'Caja' })
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
    expect(
      within(moreMenu).getByRole('link', { name: 'Caja' }).querySelector('svg')
    ).toBeInTheDocument()

    const reportsButton = within(moreMenu).getByRole('button', {
      name: 'Reportes'
    })
    expect(reportsButton.querySelector('svg')).toBeInTheDocument()
    await user.click(reportsButton)
    expect(
      within(moreMenu)
        .getByRole('link', { name: 'Ventas' })
        .querySelector('svg')
    ).toBeInTheDocument()
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
    expect(
      screen.getByRole('link', { name: 'Bajo stock' })
    ).toHaveAttribute('href', '/low-stock')
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
    expect(
      screen.getByRole('link', { name: 'Bajo stock' })
    ).toHaveAttribute('href', '/low-stock')
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

  it('staff ve inicio, pendientes, entradas, salidas, productos y proveedores', () => {
    auth.roleName = 'Staff'
    renderNav()

    expect(screen.queryByRole('button', { name: 'Reportes' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Catálogo' })).toBeNull()
    expect(
      screen.getAllByRole('link', { name: 'Pendientes' })[0]
    ).toHaveAttribute('href', '/todolist')
    expect(screen.queryByRole('link', { name: 'Caja' })).toBeNull()
    expect(screen.getAllByRole('link', { name: 'Inicio' })[0]).toHaveAttribute(
      'href',
      '/home'
    )
    expect(screen.getAllByRole('link', { name: 'Salidas' })[0]).toHaveAttribute(
      'href',
      '/issues'
    )
    expect(
      screen.getAllByRole('link', { name: 'Entradas' })[0]
    ).toHaveAttribute('href', '/entries')
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
    auth.roleName = 'Staff'
    auth.haveSchedule = false
    renderNav()

    expect(screen.queryByRole('link', { name: 'Asistencias' })).toBeNull()
  })
})
