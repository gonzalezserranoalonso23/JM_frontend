import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'

const queryClient = new QueryClient()

// Some mobile browsers (notably Chrome on iOS) miscalculate svh/dvh against the
// actually visible viewport once toolbars are on screen, cutting off content.
// window.innerHeight is always accurate, so mirror it into a CSS var as the real source of truth.
const setAppViewportHeight = () => {
  const visualViewport = window.visualViewport
  const height = visualViewport?.height || window.innerHeight
  const viewportTop = visualViewport?.offsetTop || 0
  const layoutHeight =
    document.documentElement.clientHeight || window.innerHeight
  const viewportBottomGap = Math.max(0, layoutHeight - viewportTop - height)

  document.documentElement.style.setProperty('--app-vh', `${height * 0.01}px`)
  document.documentElement.style.setProperty(
    '--app-viewport-bottom-gap',
    `${viewportBottomGap}px`
  )
}

setAppViewportHeight()
window.addEventListener('resize', setAppViewportHeight)
window.addEventListener('orientationchange', setAppViewportHeight)
window.visualViewport?.addEventListener('resize', setAppViewportHeight)

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={150}>
      <App />
    </TooltipProvider>
  </QueryClientProvider>
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
