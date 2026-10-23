import axios from '@/libs/axios'

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

const sameApplicationKey = (subscription, publicKey) => {
  const current = subscription?.options?.applicationServerKey
  if (!current) return true
  const next = urlBase64ToUint8Array(publicKey)
  const bytes = new Uint8Array(current)
  if (bytes.length !== next.length) return false
  return bytes.every((byte, index) => byte === next[index])
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

  const registration = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  const publicKey = await getVapidPublicKey()
  let subscription = await registration.pushManager.getSubscription()
  if (subscription && !sameApplicationKey(subscription, publicKey)) {
    await subscription.unsubscribe()
    subscription = null
  }

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    })
  }

  await savePushSubscription(subscription.toJSON())
  return subscription
}
