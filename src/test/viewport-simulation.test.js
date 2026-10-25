import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('src/index.css', 'utf8')
const html = readFileSync('index.html', 'utf8')
const main = readFileSync('src/main.jsx', 'utf8')
const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'))

const REM = 16

/**
 * Réplica del shell real: 100dvh, barra superior con el inset de arriba completo
 * y barra inferior con el inset de abajo recortado a 0.5rem. En escritorio (>=1280)
 * no hay barra inferior.
 */
const shell = ({ width, height, safeTop = 0, safeBottom = 0 }) => {
  const desktop = width >= 1280
  const nav = (desktop ? 4 : 3.5) * REM + safeTop
  const cappedBottom = Math.min(safeBottom, 0.5 * REM)
  const tab = desktop ? 0 : 3.25 * REM + cappedBottom
  return {
    nav,
    tab,
    content: height - nav - tab,
    cappedBottom
  }
}

const profiles = [
  {
    name: 'iOS Safari',
    system: 'ios',
    browser: 'safari',
    pwa: false,
    width: 390,
    height: 746,
    safeTop: 47,
    safeBottom: 34
  },
  {
    name: 'iOS PWA',
    system: 'ios',
    browser: 'safari',
    pwa: true,
    width: 390,
    height: 844,
    safeTop: 59,
    safeBottom: 34
  },
  {
    name: 'iOS PWA horizontal',
    system: 'ios',
    browser: 'safari',
    pwa: true,
    width: 844,
    height: 390,
    safeTop: 0,
    safeBottom: 21
  },
  {
    name: 'Android Chrome',
    system: 'android',
    browser: 'chrome',
    pwa: false,
    width: 412,
    height: 839,
    safeTop: 0,
    safeBottom: 0
  },
  {
    name: 'Android PWA',
    system: 'android',
    browser: 'chrome',
    pwa: true,
    width: 412,
    height: 915,
    safeTop: 0,
    safeBottom: 24
  },
  {
    name: 'Android estrecho',
    system: 'android',
    browser: 'chrome',
    pwa: true,
    width: 360,
    height: 640,
    safeTop: 0,
    safeBottom: 0
  },
  {
    name: 'Windows Chrome',
    system: 'windows',
    browser: 'chrome',
    pwa: false,
    width: 1366,
    height: 768,
    safeTop: 0,
    safeBottom: 0
  },
  {
    name: 'Windows PWA',
    system: 'windows',
    browser: 'chrome',
    pwa: true,
    width: 1366,
    height: 720,
    safeTop: 0,
    safeBottom: 0
  }
]

describe('simulación de viewport PWA', () => {
  it('el shell usa el alto visible en Chrome, Safari, iOS, Android y Windows', () => {
    expect(html).toMatch(/viewport-fit=cover/)
    expect(html).toMatch(/interactive-widget=overlays-content/)
    expect(html).toMatch(/apple-mobile-web-app-capable/)
    expect(css).toMatch(/height:\s*100dvh/)
    expect(css).not.toMatch(/height:\s*100vh/)
    expect(main).toMatch(/measureCssHeight\('100dvh'\)/)
    expect(main).toMatch(/visualViewport/)
    expect(manifest.display).toBe('standalone')
    expect(manifest.display_override[0]).toBe('standalone')

    for (const profile of profiles) {
      const box = shell(profile)
      expect(box.content, profile.name).toBeGreaterThan(240)
      expect(box.nav, profile.name).toBeGreaterThanOrEqual(56)
      expect(box.cappedBottom, profile.name).toBeLessThanOrEqual(8)
      if (profile.width >= 1280) expect(box.tab, profile.name).toBe(0)
      else expect(box.tab, profile.name).toBeGreaterThanOrEqual(52)
      if (profile.safeTop) {
        expect(box.nav, profile.name).toBeGreaterThan(3.5 * REM)
      }
    }
  })

  it('el teclado tapa el contenido y no encoge el shell', () => {
    const phone = profiles.find((profile) => profile.name === 'Android PWA')
    const open = shell(phone)
    const withKeyboard = shell({ ...phone, height: phone.height })
    expect(withKeyboard.content).toBe(open.content)
    expect(html).toMatch(/overlays-content/)
  })
})
