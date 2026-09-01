import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

// Some mobile browsers (notably Chrome on iOS) miscalculate svh/dvh against the
// actually visible viewport once toolbars are on screen, cutting off content.
// window.innerHeight is always accurate, so mirror it into a CSS var as the real source of truth.
const setAppViewportHeight = () => {
  const height = window.visualViewport?.height || window.innerHeight
  document.documentElement.style.setProperty('--app-vh', `${height * 0.01}px`)

  // On some mobile browsers, fixed/absolute elements stay anchored to the
  // full layout viewport when the on-screen keyboard opens, instead of the
  // shrunken visual viewport — this pushes bottom-sheet modals down/off-screen.
  // Track how much the visual viewport is inset from the bottom so we can
  // pull the sheet back up by that amount.
  const viewport = window.visualViewport
  const bottomInset = viewport
    ? Math.max(0, window.innerHeight - (viewport.height + viewport.offsetTop))
    : 0
  document.documentElement.style.setProperty(
    '--app-vv-bottom-inset',
    `${bottomInset}px`
  )
}

setAppViewportHeight()
window.addEventListener('resize', setAppViewportHeight)
window.addEventListener('orientationchange', setAppViewportHeight)
window.visualViewport?.addEventListener('resize', setAppViewportHeight)
window.visualViewport?.addEventListener('scroll', setAppViewportHeight)

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
