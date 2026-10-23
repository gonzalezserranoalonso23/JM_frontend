import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, persistOptions } from '@/lib/queryClient'
import { TooltipProvider } from '@/components/ui/tooltip'
import { limitNumberInputDecimals } from '@/utils/commonFunctions'

// innerHeight (layout viewport) is stable while the URL bar animates.
// visualViewport.height jumps on every toolbar/keyboard frame and reflows the app.
const setAppViewportHeight = () => {
  document.documentElement.style.setProperty(
    '--app-vh',
    `${window.innerHeight * 0.01}px`
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
