import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, persistOptions } from '@/lib/queryClient'
import { TooltipProvider } from '@/components/ui/tooltip'
import { limitNumberInputDecimals } from '@/utils/commonFunctions'

const standaloneDisplayQuery = window.matchMedia(
  '(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)'
)

const isStandalonePwa = () =>
  standaloneDisplayQuery.matches || window.navigator.standalone === true

// In Safari the layout viewport (innerHeight) stays stable while the URL bar
// animates. In an installed PWA that same innerHeight still subtracts the
// browser chrome, so we measure the large viewport instead.
const measureCssHeight = (heightValue) => {
  const probe = document.createElement('div')
  probe.setAttribute('aria-hidden', 'true')
  probe.style.cssText = `position:fixed;top:0;left:0;width:0;height:${heightValue};visibility:hidden;pointer-events:none`
  document.documentElement.appendChild(probe)
  const height = probe.getBoundingClientRect().height
  probe.remove()
  return height || 0
}

const measureViewportPx = () => {
  if (!isStandalonePwa()) return window.innerHeight

  return Math.round(
    Math.max(
      measureCssHeight('100lvh'),
      measureCssHeight('100dvh'),
      measureCssHeight('-webkit-fill-available'),
      window.innerHeight,
      window.visualViewport?.height ?? 0
    )
  )
}

const setAppViewportHeight = () => {
  document.documentElement.classList.toggle('is-pwa', isStandalonePwa())
  document.documentElement.style.setProperty(
    '--app-vh',
    `${measureViewportPx() * 0.01}px`
  )
}

let viewportFrame = 0
const scheduleAppViewportHeight = () => {
  if (viewportFrame) return
  viewportFrame = window.requestAnimationFrame(() => {
    viewportFrame = 0
    setAppViewportHeight()
  })
}

setAppViewportHeight()
window.addEventListener('resize', scheduleAppViewportHeight)
window.addEventListener('orientationchange', scheduleAppViewportHeight)
standaloneDisplayQuery.addEventListener?.('change', scheduleAppViewportHeight)

document.addEventListener(
  'input',
  (event) => limitNumberInputDecimals(event.target),
  true
)

createRoot(document.getElementById('root')).render(
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={persistOptions}
  >
    <TooltipProvider delayDuration={400} skipDelayDuration={0}>
      <App />
    </TooltipProvider>
  </PersistQueryClientProvider>
)
