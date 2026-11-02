import { Capacitor } from '@capacitor/core'
import {registerPush as registerWebPush, unregisterPush as unregisterWebPush,} from '@/services/PushSubscriptionService'
import {registerNativePush, unregisterNativePush,} from '@/services/NativePushSubscriptionService'

export { default as PushNotificationButtons } from '@/layouts/components/PushNotificationButtons.vue'

export function registerPush(askPermission = false) {
  return Capacitor.isNativePlatform()
    ? registerNativePush(askPermission)
    : registerWebPush(askPermission)
}

export function unregisterPush() {
  return Capacitor.isNativePlatform()
    ? unregisterNativePush()
    : unregisterWebPush()
}
