import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

const html = readFileSync('index.html', 'utf8')
const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'))

describe('metadatos', () => {
  it('describe la app como herramienta de control de inventario', () => {
    expect(html).toMatch(/control de inventario/i)
    expect(html).toMatch(/name="description"/)
    expect(manifest.description).toMatch(/inventario/i)
    expect(manifest.categories).toContain('business')
  })

  it('no sugiere juegos ni pasatiempos', () => {
    expect(html + JSON.stringify(manifest)).not.toMatch(
      /\b(juego|game|hobby|casino|apuesta)\b/i
    )
  })

  it('es responsive y no se indexa', () => {
    expect(html).toMatch(/width=device-width/)
    expect(html).toMatch(/viewport-fit=cover/)
    expect(html).toMatch(/noindex/)
  })

  it('los iconos del manifiesto existen', () => {
    expect(manifest.display).toBe('standalone')
    expect(manifest.display_override[0]).toBe('standalone')
    const sources = [
      ...manifest.icons.map((icon) => icon.src),
      ...manifest.shortcuts.flatMap((shortcut) =>
        (shortcut.icons || []).map((icon) => icon.src)
      )
    ]
    for (const src of sources) {
      expect(existsSync(`public${src}`), src).toBe(true)
    }
    expect(existsSync('public/apple-touch-icon.png')).toBe(true)
  })
})
