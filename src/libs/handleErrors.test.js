import { afterEach, describe, expect, it, vi } from 'vitest'
import { errorMessage, handleErrors, notifyError } from './handleErrors'

vi.mock('react-hot-toast', () => ({
  toast: { error: vi.fn() }
}))

import { toast } from 'react-hot-toast'

const setOnline = (value) => {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value
  })
}

describe('handleErrors', () => {
  afterEach(() => {
    setOnline(true)
    vi.clearAllMocks()
  })

  it('sin internet', () => {
    setOnline(false)
    expect(handleErrors({ code: 'ERR_NETWORK' })).toMatchObject({
      offline: true,
      message: 'Sin conexión a internet'
    })
  })

  it('servidor inalcanzable con internet', () => {
    expect(handleErrors({ code: 'ERR_NETWORK' }).message).toBe(
      'No se pudo conectar con el servidor'
    )
  })

  it('timeout', () => {
    expect(handleErrors({ code: 'ECONNABORTED' })).toMatchObject({
      status: 408,
      message: 'La solicitud tardó demasiado. Intenta de nuevo.'
    })
  })

  it('ignora una petición cancelada', () => {
    expect(handleErrors({ code: 'ERR_CANCELED' }).ignore).toBe(true)
    notifyError({ code: 'ERR_CANCELED' })
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('400 usa el mensaje del servidor y si no hay, el de la pantalla', () => {
    const withMessage = {
      response: { status: 400, data: { message: 'Stock insuficiente de Agua' } }
    }
    expect(errorMessage(withMessage, 'Error al registrar')).toBe(
      'Stock insuficiente de Agua'
    )

    const bare = { response: { status: 400, data: {} } }
    expect(errorMessage(bare, 'Error al registrar')).toBe('Error al registrar')
  })

  it('404, 401 y 500 tienen texto propio', () => {
    expect(handleErrors({ response: { status: 404, data: {} } }).message).toBe(
      'No se encontró lo que buscabas'
    )
    expect(handleErrors({ response: { status: 401, data: {} } })).toMatchObject({
      logout: true,
      message: 'Sesión vencida. Vuelve a entrar.'
    })
    expect(handleErrors({ response: { status: 500, data: {} } }).message).toBe(
      'Error del servidor. Intenta de nuevo.'
    )
  })

  it('un 3xx con Location se puede redirigir', () => {
    expect(
      handleErrors({
        response: { status: 302, data: {}, headers: { location: '/login' } }
      })
    ).toMatchObject({ status: 302, redirectTo: '/login' })
  })

  it('no redirige a un destino externo sospechoso', () => {
    expect(
      handleErrors({
        response: {
          status: 302,
          data: {},
          headers: { location: 'javascript:alert(1)' }
        }
      }).redirectTo
    ).toBeNull()
  })
})
