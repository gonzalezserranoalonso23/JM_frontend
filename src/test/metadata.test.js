import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

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
    expect(html).toMatch(/noindex/)
  })
})
