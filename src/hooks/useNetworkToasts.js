import { useEffect } from 'react'
import { toast } from 'react-hot-toast'

const OFFLINE_ID = 'network-offline'
const ONLINE_ID = 'network-online'

const baseStyle = { color: '#fff', fontWeight: 500 }

const showOffline = () => {
  toast.dismiss(ONLINE_ID)
  toast.error('Sin conexión a internet', {
    id: OFFLINE_ID,
    duration: Infinity,
    style: { ...baseStyle, background: '#dc2626' },
    iconTheme: { primary: '#fff', secondary: '#dc2626' }
  })
}

const showOnline = () => {
  toast.dismiss(OFFLINE_ID)
  toast.success('Regresó la conexión', {
    id: ONLINE_ID,
    duration: 3000,
    style: { ...baseStyle, background: '#16a34a' },
    iconTheme: { primary: '#fff', secondary: '#16a34a' }
  })
}

const useNetworkToasts = () => {
  useEffect(() => {
    if (!navigator.onLine) showOffline()

    window.addEventListener('offline', showOffline)
    window.addEventListener('online', showOnline)
    return () => {
      window.removeEventListener('offline', showOffline)
      window.removeEventListener('online', showOnline)
      toast.dismiss(OFFLINE_ID)
    }
  }, [])
}

export default useNetworkToasts
