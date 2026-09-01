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
}

setAppViewportHeight()
window.addEventListener('resize', setAppViewportHeight)
window.addEventListener('orientationchange', setAppViewportHeight)
window.visualViewport?.addEventListener('resize', setAppViewportHeight)

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
