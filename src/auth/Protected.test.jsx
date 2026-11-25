import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Protected from './Protected'
import { appRoutes } from './appRoutes'
import { routeRules } from './access'

const auth = vi.hoisted(() => ({
  auth: 'token',
  isAdmin: false,
  me: { isAdmin: false },
  isLoading: false
}))

vi.mock('@/store/auth', () => ({
  useAuthStore: (selector) =>
    selector({
      auth: auth.auth,
      isAdmin: auth.isAdmin
    })
}))

vi.mock('@/features/users.features', () => ({
  useGetCurrentUser: () => ({
    data: auth.me,
    isLoading: auth.isLoading
  })
}))

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<h1>Login</h1>} />
        <Route element={<Protected />}>
          <Route path="/home" element={<h1>Inicio</h1>} />
          <Route path="/daily-information" element={<h1>Información</h1>} />
          <Route path="/users" element={<h1>Usuarios</h1>} />
          <Route path="/products" element={<h1>Productos</h1>} />
          <Route path="/entries/:id" element={<h1>Entrada</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )

describe('rutas protegidas por usuario', () => {
  afterEach(() => {
    cleanup()
    auth.auth = 'token'
    auth.isAdmin = false
    auth.me = { isAdmin: false }
    auth.isLoading = false
  })

  it('cada ruta de la app declara quién puede entrar', () => {
    expect(appRoutes.map((route) => route.path)).toEqual(
      routeRules.map((rule) => rule.path)
    )
    expect(appRoutes.every((route) => route.Component)).toBe(true)
  })

  it('sin sesión manda al login', () => {
    auth.auth = ''
    auth.isAdmin = false
    auth.me = undefined
    renderAt('/products')
    expect(screen.getByRole('heading', { name: 'Login' })).toBeTruthy()
  })

})
