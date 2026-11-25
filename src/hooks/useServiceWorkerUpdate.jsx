import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/atoms/button'

const UPDATE_ID = 'app-update'

const showUpdate = (worker) => {
  toast(
    (t) => (
      <span className="flex items-center gap-3">
        <span>Hay una nueva versión disponible</span>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            toast.dismiss(t.id)
            worker.postMessage({ type: 'SKIP_WAITING' })
          }}
        >
          Actualizar
        </Button>
      </span>
    ),
    { id: UPDATE_ID, duration: Infinity }
  )
}

// Register the service worker and warn when a new version is waiting.
const useServiceWorkerUpdate = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return

    const sw = navigator.serviceWorker
    let reloading = false
    const onControllerChange = () => {
      if (reloading) return
      reloading = true
      window.location.reload()
    }
    // Reload only when a service worker was already there, not on the first install.
    const hadController = Boolean(sw.controller)
    if (hadController) {
      sw.addEventListener('controllerchange', onControllerChange)
    }

    let registration
    const onVisible = () => {
      if (document.visibilityState === 'visible') registration?.update()
    }

    sw.register('/sw.js')
      .then((reg) => {
        registration = reg
        if (reg.waiting && hadController) showUpdate(reg.waiting)
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && sw.controller) {
              showUpdate(worker)
            }
          })
        })
        document.addEventListener('visibilitychange', onVisible)
      })
      .catch(() => {})

    return () => {
      sw.removeEventListener('controllerchange', onControllerChange)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
}

export default useServiceWorkerUpdate
