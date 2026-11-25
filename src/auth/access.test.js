import { describe, expect, it } from 'vitest'
import { canVisit, routeRules } from './access'

describe('acceso por rol', () => {
  it('un usuario no administrador entra al alcance operativo, pero no a administración', () => {
    expect(canVisit(false, '/home')).toBe(true)
    expect(canVisit(false, '/products')).toBe(true)
    expect(canVisit(false, '/suppliers')).toBe(true)
    expect(canVisit(false, '/reports')).toBe(false)
    expect(canVisit(false, '/users')).toBe(false)
  })

  it('staff entra a información, asistencia, productos y proveedores', () => {
    expect(canVisit(false, '/products')).toBe(true)
    expect(canVisit(false, '/suppliers')).toBe(true)
    expect(canVisit(false, '/attendance')).toBe(true)
    expect(canVisit(false, '/daily-information')).toBe(true)
    expect(canVisit(false, '/reports')).toBe(false)
    expect(canVisit(false, '/entries')).toBe(false)
    expect(canVisit(false, '/cash')).toBe(true)
  })

  it('no registra las rutas retiradas de promociones ni órdenes', () => {
    expect(routeRules.some(({ path }) => path === '/promotions')).toBe(false)
    expect(routeRules.some(({ path }) => path === '/orders')).toBe(false)
  })

  it('los administradores entran a reportes y asistencia', () => {
    expect(canVisit(true, '/reports')).toBe(true)
    expect(canVisit(true, '/attendance')).toBe(true)
    expect(canVisit(true, '/daily-information')).toBe(true)
  })

  it('los dos tipos de cuenta respetan el acceso', () => {
    expect(canVisit(true, '/reports')).toBe(true)
    expect(canVisit(true, '/daily-information')).toBe(true)
    expect(canVisit(false, '/attendance')).toBe(true)
    expect(canVisit('Legacy', '/ruta-desconocida')).toBe(false)
    expect(canVisit('', '/daily-information')).toBe(false)
    expect(canVisit(false, '/users')).toBe(false)
  })

})
