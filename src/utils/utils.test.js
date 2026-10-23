import { describe, it, expect } from 'vitest'
import { isoDay, formatDate, todayLocal } from './dateDisplay'
import { buildMatcher, matchesCells } from './filterMatcher'
import {
  clampNumberInputValue,
  formatQty,
  limitNumberInputDecimals,
  roundTo
} from './commonFunctions'

describe('dateDisplay', () => {
  it('isoDay conserva el día guardado sin cambiar zona horaria', () => {
    expect(isoDay('2026-03-05T23:59:59.000Z')).toBe('2026-03-05')
    expect(isoDay('15/10/2026')).toBe('2026-10-15')
    expect(isoDay('16/10/26')).toBe('2026-10-16')
    expect(isoDay('')).toBe('')
    expect(isoDay('basura')).toBe('')
    expect(isoDay('31/02/2026')).toBe('')
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

describe('clampNumberInputValue', () => {
  it('permite hasta 3 decimales y recorta el resto', () => {
    expect(clampNumberInputValue('1.234')).toBe('1.234')
    expect(clampNumberInputValue('1.2345')).toBe('1.234')
    expect(clampNumberInputValue('-0.0019')).toBe('-0.001')
    expect(clampNumberInputValue('12')).toBe('12')
    expect(clampNumberInputValue('1.2')).toBe('1.2')
  })

  it('solo aplica a inputs number', () => {
    const numberInput = { tagName: 'INPUT', type: 'number', value: '1.23456' }
    const textInput = { tagName: 'INPUT', type: 'text', value: '1.23456' }
    limitNumberInputDecimals(numberInput)
    limitNumberInputDecimals(textInput)
    expect(numberInput.value).toBe('1.234')
    expect(textInput.value).toBe('1.23456')
  })
})

describe('roundTo', () => {
  it('recorta cantidades a 3 decimales sin arrastrar basura flotante', () => {
    expect(formatQty(0.30000000000000004)).toBe(0.3)
    expect(formatQty(1.2346)).toBe(1.235)
    expect(roundTo(12.3456, 2)).toBe(12.35)
    expect(roundTo('1.005', 2)).toBe(1.01)
  })
})
