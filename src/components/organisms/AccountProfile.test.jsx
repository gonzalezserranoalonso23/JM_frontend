import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { TooltipProvider } from '@/components/atoms/tooltip'
import { useAppState } from '@/store/appState'
import AccountProfile from './AccountProfile'

const profile = vi.hoisted(() => ({
  data: null,
  isLoading: false,
  isError: false
}))

vi.mock('@/features/users.features', () => ({
  useGetCurrentUser: () => profile
}))

const appActions = vi.hoisted(() => ({
  shutdown: vi.fn(),
  startup: vi.fn()
}))

vi.mock('@/features/app.features', () => ({
  useShutdownApp: () => ({ mutate: appActions.shutdown, isPending: false }),
  useStartupApp: () => ({ mutate: appActions.startup, isPending: false })
}))

const locationPrompt = vi.hoisted(() => ({
  show: true,
  request: vi.fn()
}))

vi.mock('@/hooks/useLocationPrompt', () => ({
  default: () => locationPrompt
}))

vi.mock('@/features/suppliers.features', () => ({
  useGetSuppliers: () => ({ data: [] })
}))

vi.mock('@/features/attendance.features', () => ({
  useMyAttendance: () => ({
    data: { pages: [{ open: null, workDay: true, records: [] }] },
    isError: false
  }),
  useCheckIn: () => ({ mutate: vi.fn(), isPending: false }),
  useCheckOut: () => ({ mutate: vi.fn(), isPending: false }),
  useAttendanceDay: () => ({ data: null, isLoading: false, isError: false })
}))

const openProfile = async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  render(
    <MemoryRouter initialEntries={['/home']}>
      <TooltipProvider>
        <AccountProfile />
      </TooltipProvider>
    </MemoryRouter>
  )
  await user.click(screen.getByRole('button', { name: 'Mi información' }))
  return user
}

describe('Mi información', () => {
  afterEach(() => {
    cleanup()
    profile.data = null
    profile.isLoading = false
    profile.isError = false
    localStorage.removeItem('jm-theme')
    document.documentElement.classList.add('dark')
    locationPrompt.show = true
    locationPrompt.request.mockClear()
    appActions.shutdown.mockClear()
    appActions.startup.mockClear()
    useAppState.setState({ shutdown: false, ready: true })
  })

  it('muestra la información y el horario de Staff', async () => {
    profile.data = {
      username: 'cajero',
      fullName: 'Ana Ruiz',
      email: 'ana@jm.test',
      role: { name: 'Staff' },
      salary: 2100
    }
    await openProfile()

    expect(screen.getByText('cajero')).toBeTruthy()
    expect(screen.getByText('Ana Ruiz')).toBeTruthy()
    expect(screen.getByText('Staff')).toBeTruthy()
    expect(screen.getByText('Salario semanal (MXN)')).toBeTruthy()
    expect(screen.getByText('$2100.00')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Horario' })).toBeTruthy()
    expect(screen.getAllByText('No trabaja').length).toBe(7)
    expect(screen.queryByRole('button', { name: 'Checador' })).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Registrar entrada' })
    ).toBeNull()
  })

  it('el manager no muestra horario ni checador', async () => {
    profile.data = {
      username: 'admin',
      email: 'admin@jm.test',
      role: { name: 'Manager' },
      haveSchedule: true,
      schedule: {
        monday: { enabled: true, start: '09:00', end: '18:00' }
      }
    }
    await openProfile()

    expect(screen.getByText('Manager')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Horario' })).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Registrar entrada' })
    ).toBeNull()
  })

  it('el supervisor registra su entrada desde el avatar', async () => {
    profile.data = {
      username: 'turno',
      email: 'turno@jm.test',
      role: { name: 'Supervisor' },
      haveSchedule: true,
      schedule: {
        monday: { enabled: true, start: '07:00', end: '15:00' }
      }
    }
    await openProfile()

    expect(screen.getByText('Supervisor')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Horario' })).toBeTruthy()
    expect(
      await screen.findByRole('button', { name: 'Registrar entrada' })
    ).toBeTruthy()
  })

  it('oculta el horario de un administrador que no lo tiene', async () => {
    profile.data = {
      username: 'admin',
      email: 'admin@jm.test',
      role: { name: 'Manager' },
      haveSchedule: false
    }
    await openProfile()

    expect(screen.getByText('Manager')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Horario' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Checador' })).toBeNull()
  })

  it('cambia al tema claro y lo recuerda', async () => {
    profile.data = {
      username: 'admin',
      email: 'admin@jm.test',
      role: { name: 'Manager' },
      haveSchedule: false
    }
    const user = await openProfile()

    await user.click(screen.getByRole('button', { name: 'Claro' }))

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('jm-theme')).toBe('light')
  })

  it('el usuario activa notificaciones y ubicación desde el avatar', async () => {
    profile.data = {
      username: 'cajero',
      fullName: 'Ana Ruiz',
      email: 'ana@jm.test',
      role: { name: 'Staff' }
    }
    locationPrompt.show = true
    const requestNotifications = vi.fn()
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(
      <MemoryRouter initialEntries={['/home']}>
        <TooltipProvider>
          <AccountProfile
            notifications={{ show: true, request: requestNotifications }}
          />
        </TooltipProvider>
      </MemoryRouter>
    )
    await user.click(screen.getByRole('button', { name: 'Mi información' }))
    await user.click(
      screen.getByRole('button', { name: 'Activar notificaciones' })
    )
    await user.click(screen.getByRole('button', { name: 'Permitir ubicación' }))

    expect(requestNotifications).toHaveBeenCalledOnce()
    expect(locationPrompt.request).toHaveBeenCalledOnce()
  })

  it('sudo puede apagar la aplicación desde el avatar', async () => {
    profile.data = {
      username: 'glezalonso23',
      email: 'alonso@jm.test',
      role: { name: 'Sudo' },
      haveSchedule: false
    }
    await openProfile()

    expect(
      screen.getByRole('button', { name: 'Apagar aplicación' })
    ).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Horario' })).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Activar aplicación' })
    ).toBeNull()
  })

  it('con la aplicación apagada el sudo la activa', async () => {
    profile.data = {
      username: 'glezalonso23',
      role: { name: 'Sudo' },
      haveSchedule: false
    }
    useAppState.setState({ shutdown: true, ready: true })
    const user = await openProfile()

    expect(
      screen.queryByRole('button', { name: 'Apagar aplicación' })
    ).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Activar aplicación' }))
    expect(appActions.startup).toHaveBeenCalledOnce()
  })
})
