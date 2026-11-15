import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import DisconnectedScreen from './DisconnectedScreen'
import { useAuthStore } from '@/store/auth'

const support = vi.hoisted(() => ({
  mutate: vi.fn()
}))

vi.mock('@/features/app.features', () => ({
  useSupportLogin: () => ({ mutate: support.mutate, isPending: false })
}))

vi.mock('@/features/users.features', () => ({
  useLogin: () => ({ mutate: vi.fn(), isPending: false })
}))

describe('pantalla desconectado', () => {
  afterEach(() => {
    cleanup()
    useAuthStore.setState({ auth: '', isLogged: false, profile: '', role: '' })
  })

  it('el footer abre el usuario aunque haya una sesión sudo', async () => {
    const user = userEvent.setup()
    useAuthStore.setState({
      auth: 'token',
      isLogged: true,
      profile: 'glezalonso23',
      role: 'Sudo'
    })
    render(<DisconnectedScreen />)

    const heading = screen.getByRole('heading', { name: 'Desconectada' })
    expect(heading.closest('main').className).toContain('bg-background')
    expect(screen.queryByRole('button', { name: 'Activar aplicación' })).toBeNull()
    expect(screen.queryByLabelText('Contraseña')).toBeNull()

    const note = screen.getByText('support@site.com')
    expect(note.tagName).toBe('P')
    expect(note.closest('footer')).toBeTruthy()
    await user.click(note)

    expect(screen.getByRole('heading', { name: 'Soporte' })).toBeTruthy()
    expect(screen.getByLabelText('Usuario')).toBeTruthy()
  })

  it('el enlace de soporte abre el nombre y solo un sudo llega al inicio de sesión', async () => {
    const user = userEvent.setup()
    support.mutate.mockImplementation((username, { onSuccess }) =>
      onSuccess({ allowed: username === 'glezalonso23' })
    )
    render(<DisconnectedScreen />)

    expect(screen.queryByRole('button', { name: 'Activar aplicación' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Desconectada' })).toBeTruthy()
    expect(screen.queryByLabelText('Contraseña')).toBeNull()

    await user.click(screen.getByText('support@site.com'))
    await user.type(screen.getByLabelText('Usuario'), 'otro')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(screen.getByText('No se puede continuar')).toBeTruthy()
    expect(screen.queryByLabelText('Contraseña')).toBeNull()

    await user.clear(screen.getByLabelText('Usuario'))
    await user.type(screen.getByLabelText('Usuario'), 'glezalonso23')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(screen.getByLabelText('Usuario')).toHaveValue('glezalonso23')
    expect(screen.getByLabelText('Contraseña')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeTruthy()
  })
})
