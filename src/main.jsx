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

// 100dvh follows the visible screen, including an installed PWA where
// innerHeight still reserves the browser toolbar.
const measureCssHeight = (heightValue) => {
  const probe = document.createElement('div')
  probe.setAttribute('aria-hidden', 'true')
  probe.style.cssText = `position:fixed;top:0;left:0;width:0;height:${heightValue};visibility:hidden;pointer-events:none`
  document.documentElement.appendChild(probe)
  const height = probe.getBoundingClientRect().height
  probe.remove()
  return height || 0
}

const measureViewportPx = () =>
  Math.round(
    measureCssHeight('100dvh') ||
      window.visualViewport?.height ||
      window.innerHeight
  )

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
window.visualViewport?.addEventListener('resize', scheduleAppViewportHeight)
window.visualViewport?.addEventListener('scroll', scheduleAppViewportHeight)
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
