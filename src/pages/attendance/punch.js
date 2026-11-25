import { toast } from 'react-hot-toast'

const readPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Este dispositivo no puede compartir la ubicación'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }),
      () =>
        reject(
          new Error(
            'Activa la ubicación para registrar la entrada en el trabajo'
          )
        ),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  })

const punchAtWork = (mutate, extra) => {
  readPosition().then(
    (position) => mutate({ ...position, ...extra }),
    (error) => toast.error(error.message)
  )
}

export const confirmPunch = ({
  open,
  checkIn,
  checkOut
}) => {
  if (open) {
    if (!window.confirm('¿Registrar tu salida?')) return
    punchAtWork(checkOut.mutate, {})
    return
  }
  if (!window.confirm('¿Registrar tu entrada?')) return
  punchAtWork(checkIn.mutate, {})
}
