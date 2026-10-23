import axios from '@/libs/axios'

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

const getVapidPublicKey = async () => {
  const { data } = await axios.get('/api/push/vapid-public-key')
  return data.publicKey
}

const savePushSubscription = async (subscription) => {
  const { data } = await axios.post('/api/push/subscribe', subscription)
  return data
}

export const subscribeBrowserPush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null

  let registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    registration = await navigator.serviceWorker.register('/sw.js')
  }
  await navigator.serviceWorker.ready

  const publicKey = await getVapidPublicKey()
  const existing = await registration.pushManager.getSubscription()
  const subscription =
    existing ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    }))

  await savePushSubscription(subscription.toJSON())
  return subscription
}
