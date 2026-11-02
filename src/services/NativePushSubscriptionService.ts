import { PushNotifications } from '@capacitor/push-notifications'
import { apiClient } from '@/services/ApiClient'

let currentToken: string | null = null


export async function registerNativePush(askPermission = false) {

  await PushNotifications.createChannel({
    id: 'default_notification_channel_id',
    name: 'REMSFAL-Benachrichtigungen',
    description: 'Wichtige Benachrichtigungen von REMSFAL',
    importance: 4,
    visibility: 1,
    vibration: true,
  })

  const permission = await PushNotifications.checkPermissions()

  if (permission.receive !== 'granted') {
    if (!askPermission) return 'needs-permission'

    const requested = await PushNotifications.requestPermissions()
    if (requested.receive !== 'granted') return 'denied'
  }

  await PushNotifications.removeAllListeners()

  await PushNotifications.addListener('registration', async ({ value: token }) => {
    console.log('[native-push] FCM token:', token)

    currentToken = token
    await apiClient.post('/notification/v1/push-subscriptions', {
      fidToken: token,
      platform: 'ANDROID'
    })
    console.log('[native-push] registered')

  })

  await PushNotifications.addListener('registrationError', (error) => {
    console.error('[native-push] registration failed', error)
  })

  await PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('[native-push] foreground notification', notification)
  })

  await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('[native-push] notification opened', action)
  })
  await PushNotifications.register()
  return 'registered'
}
export async function unregisterNativePush(): Promise<void> {
  if (!currentToken) return

  const fidToken = currentToken

  try {
    await apiClient.delete('/notification/v1/push-subscriptions/{fidToken}', {pathParams: { fidToken }})
    currentToken = null // erst hier, nach erfolgreichem DELETE;
    // sonst kann Token bei einem Netzwerkfehler nicht mehr erneut abgemeldet werden
  } catch (error) {
    console.warn('[native-push] unregister failed', error)
  }
}
