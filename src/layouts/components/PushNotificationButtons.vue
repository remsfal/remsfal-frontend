<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import { useEventBus } from '@/stores/EventStore'
import { pushSubscriptionService } from '@/services/PushSubscriptionService'
import { registerPush } from '@/features/common/push'
import { isNativePlatform } from '@/helper/platform'
import { PushNotifications } from '@capacitor/push-notifications'

const { t } = useI18n()
const bus = useEventBus()

const onRegister = async () => {
  let result: string
  try {
    result = await registerPush(true)
  } catch (error) {
    console.warn('[push] registration failed', error)
    result = 'failed'
  }
  bus.emit('toast:translate', {
    severity: result === 'registered' ? 'success' : 'warn',
    summary: 'push.title',
    detail: `push.result.${result}`,
  })
}

const onSendTest = async () => {
  let permission: string

  if (isNativePlatform()) {
    permission = (await PushNotifications.checkPermissions()).receive
  } else {
    permission = Notification.permission
  }

  if (permission !== 'granted') {
    bus.emit('toast:translate', {
      severity: 'warn',
      summary: 'push.title',
      detail: `push.result.${permission === 'denied' ? 'denied' : 'needs-permission'}`,
    })
    return
  }

  try {
    await pushSubscriptionService.sendTestPush()
    /*bus.emit('toast:translate', {
      severity: 'success',
      summary: 'push.title',
      detail: 'push.testSent',
    })*/
  } catch (error) {
    console.error('[push] test push failed', error)
    bus.emit('toast:translate', {
      severity: 'error',
      summary: 'push.title',
      detail: 'push.testFailed',
    })
  }
}
</script>

<template>
  <div class="flex gap-2">
    <Button
      icon="pi pi-bell"
      :aria-label="t('push.register')"
      :title="t('push.register')"
      @click="onRegister"
    />
    <Button
      class="push-test-button"
      :label="t('push.sendTest')"
      icon="pi pi-send"
      :aria-label="t('push.sendTest')"
      :title="t('push.sendTest')"
      severity="secondary"
      @click="onSendTest"
    />
  </div>
</template>
<style scoped>
@media (width <= 991px) {
  .push-test-button :deep(.p-button-label) {
    display: none;
  }
}
</style>
