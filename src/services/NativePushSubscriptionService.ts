import { PushNotifications } from '@capacitor/push-notifications'
import { apiClient } from '@/services/ApiClient'
import router from "@/router";
import { FCM } from '@capacitor-community/fcm'
import {Capacitor} from "@capacitor/core";

let currentToken: string | null = null

async function registerFcmToken(token: string): Promise<void> {
  currentToken = token
  await apiClient.post('/notification/v1/push-subscriptions', {token: token})
}

export async function registerNativePush(askPermission = false) {

  if (Capacitor.getPlatform() === 'android') {
    await PushNotifications.createChannel({
      id: 'default_notification_channel_id',
      name: 'REMSFAL-Benachrichtigungen',
      description: 'Wichtige Benachrichtigungen von REMSFAL',
      importance: 4,
      visibility: 1,
      vibration: true,
    })
  }

  const permission = await PushNotifications.checkPermissions()

  if (permission.receive !== 'granted') {
    if (!askPermission) return 'needs-permission'

    const requested = await PushNotifications.requestPermissions()
    if (requested.receive !== 'granted') return 'denied'
  }

  await PushNotifications.removeAllListeners()

  await PushNotifications.addListener('registration', async () => {
    try {
      const { token } = await FCM.getToken()
      await registerFcmToken(token)

      console.log('[native-push] registered')
    } catch (error) {
      console.error('[native-push] registration failed', error)
    }
  })

  await PushNotifications.addListener('registrationError', (error) => {
    console.error('[native-push] registration failed', error)
  })

  await PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('[native-push] foreground notification', notification)
  })

  // für das Routing nach dem Anklicken der Nachricht
  await PushNotifications.addListener('pushNotificationActionPerformed', async (action) => {
    console.log('[native-push] notification opened', action)
    const issueId = action.notification.data?.issueId
    if (typeof issueId !== 'string') return

    await router.push({
      name: 'TenantIssueDetails',
      params: { issueId },
    })
  })

  await PushNotifications.register()

  // Reagiert auf eine Token-Erneuerung, insbesondere auf iOS.
  await FCM.addListener('tokenReceived', async ({ token }) => {
    try {
      await registerFcmToken(token)
    } catch (error) {
      console.error('[native-push] token refresh registration failed', error)
    }
  })

  return 'registered'
}

export async function unregisterNativePush(): Promise<void> {
  if (!currentToken) return

  const token = currentToken

  try {
    await apiClient.delete('/notification/v1/push-subscriptions/{token}', {pathParams: { token }})
    currentToken = null
  } catch (error) {
    console.warn('[native-push] unregister failed', error)
  }
}
