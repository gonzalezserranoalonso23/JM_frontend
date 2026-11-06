import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

const blockedMessage =
  'El navegador bloqueó la ubicación. En los ajustes del sitio, permite la ubicación para poder checar.'

const initialState = () => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return 'unsupported'
  }
  return 'prompt'
}

const useLocationPrompt = () => {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    if (state === 'unsupported' || !navigator.permissions?.query) {
      return undefined
    }
    let status
    let cancelled = false
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        if (cancelled) return
        status = result
        setState(result.state)
        result.onchange = () => setState(result.state)
      })
      .catch(() => {})
    return () => {
      cancelled = true
      if (status) status.onchange = null
    }
  }, [state])

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Este dispositivo no puede compartir la ubicación')
      return
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setState('granted')
        toast.success('Ubicación activada')
      },
      () => {
        setState('denied')
        toast.error(blockedMessage)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }, [])

  return {
    show: state === 'prompt' || state === 'denied',
    request
  }
}

export default useLocationPrompt
