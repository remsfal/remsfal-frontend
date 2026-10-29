import { initializeApp } from 'firebase/app'
import { getMessaging, isSupported, onMessage, onRegistered, register } from 'firebase/messaging'
import { apiClient } from '@/services/ApiClient'
import { useUserSessionStore } from '@/stores/UserSession'

const app = initializeApp({
  apiKey: 'AIzaSyD4NEv5CPRskeRXJm0rzPs-Ix52qZx5BWw',
  authDomain: 'remsfal-fcb-notification.firebaseapp.com',
  projectId: 'remsfal-fcb-notification',
  storageBucket: 'remsfal-fcb-notification.firebasestorage.app',
  messagingSenderId: '156263737138',
  appId: '1:156263737138:web:e66c4c6c854634ab20d92b',
  measurementId: 'G-S1PJW7645W',
})

let unsubscribe: (() => void) | null = null
let unsubscribeMessage: (() => void) | null = null
let currentFid: string | null = null

export type PushRegistrationResult = 'registered' | 'needs-permission' | 'denied' | 'unsupported' | 'no-session'

class PushSubscriptionService {
  async sendTestPush(): Promise<void> {
    await apiClient.post('/notification/v1/push-subscriptions/test', undefined)
  }
}

export const pushSubscriptionService = new PushSubscriptionService()

export async function registerPush(askPermission = false): Promise<PushRegistrationResult> {
  const session = useUserSessionStore()
  if (!session.user) return 'no-session'
  if (!(await isSupported())) return 'unsupported'

  let permission = Notification.permission
  if (permission === 'default') {
    if (!askPermission) return 'needs-permission'
    permission = await Notification.requestPermission()
  }
  if (permission !== 'granted') return 'denied'

  const messaging = getMessaging(app)
  unsubscribeMessage?.()
  unsubscribeMessage = onMessage(messaging, async (payload) => {
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification(payload.notification?.title ?? 'REMSFAL', {body: payload.notification?.body,})
  })

  const serviceWorkerRegistration = await navigator.serviceWorker.ready
  unsubscribe?.()
  unsubscribe = onRegistered(messaging, async (fid) => {
    currentFid = fid
    await apiClient.post('/notification/v1/push-subscriptions', { fid, platform: 'WEB' })
  })

  await register(messaging, {
    vapidKey: 'BCpPpz-9d-FcGX1D0f_SjQXwh_yxDe4yy0S6pLBZOsYK7dVqDDca4LeqS3jnz6CrU-0MRUAm8ekek6dDM7fpCW4',
    serviceWorkerRegistration,
  })
  return 'registered'
}

export async function unregisterPush(): Promise<void> {
  if (!currentFid) return
  const fid = currentFid
  currentFid = null
  try {
    await apiClient.delete('/notification/v1/push-subscriptions/{fid}', { pathParams: { fid } })
  } catch (error) {
    console.warn('[push] unregister failed', error)
  }
}
