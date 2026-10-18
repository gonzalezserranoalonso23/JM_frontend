import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'

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

// Registra el service worker y avisa cuando hay una versión nueva en espera.
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
    // Solo se recarga si ya había un SW (actualización), no en la primera instalación.
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
