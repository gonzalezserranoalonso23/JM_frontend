import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Login from './Login'

vi.mock('@/store/auth', () => ({
  useAuthStore: (selector) =>
    selector({
      auth: null,
      logOut: vi.fn()
    })
}))

vi.mock('@/features/users.features', () => ({
  useLogin: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null
  })
}))

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )

describe('Inicio de sesión', () => {
  afterEach(() => {
    cleanup()
    localStorage.removeItem('jm-remembered-user')
  })

  it('no ofrece la contraseña guardada hasta que se toca el campo', async () => {
    localStorage.setItem('jm-remembered-user', 'glezalonso23')
    const user = userEvent.setup()
    renderLogin()

    const password = screen.getByLabelText('Contraseña')

    expect(password).toHaveAttribute('type', 'text')
    expect(password).toHaveAttribute('readonly')
    expect(password).toHaveAttribute('autocomplete', 'off')
    expect(screen.getByLabelText('Usuario')).toHaveValue('glezalonso23')

    await user.click(password)

    expect(password).toHaveAttribute('type', 'password')
    expect(password).not.toHaveAttribute('readonly')
    expect(password).toHaveAttribute('autocomplete', 'current-password')
  })
})
