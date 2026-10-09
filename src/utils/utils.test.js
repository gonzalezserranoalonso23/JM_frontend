import { describe, it, expect } from 'vitest'
import { isoDay, formatDate, todayLocal } from './dateDisplay'
import { buildMatcher, matchesCells } from './filterMatcher'

describe('dateDisplay', () => {
  it('isoDay conserva el día guardado sin cambiar zona horaria', () => {
    expect(isoDay('2026-03-05T23:59:59.000Z')).toBe('2026-03-05')
    expect(isoDay('')).toBe('')
    expect(isoDay('basura')).toBe('')
  })

  it('formatDate regresa vacío con fechas inválidas', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate('2026-01-02', 'es-MX')).toContain('2026')
  })

  it('todayLocal tiene formato YYYY-MM-DD', () => {
    expect(todayLocal()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(todayLocal(1) > todayLocal()).toBe(true)
  })
})

describe('filterMatcher', () => {
  it('sin patrón no filtra', () => {
    expect(buildMatcher('  ')).toBeNull()
    expect(matchesCells(['a'], null)).toBe(true)
  })

  it('coincide por includes sin importar mayúsculas', () => {
    const m = buildMatcher('cola')
    expect(m('Coca COLA 600ml')).toBe(true)
    expect(m('Agua')).toBe(false)
  })

  it('un patrón inválido no truena', () => {
    const m = buildMatcher('(')
    expect(m('a (b')).toBe(true)
  })
})
