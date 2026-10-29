<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import { useEventBus } from '@/stores/EventStore'
import { pushSubscriptionService, registerPush } from '@/services/PushSubscriptionService'

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
  if (Notification.permission !== 'granted') {
    bus.emit('toast:translate', {
      severity: 'warn',
      summary: 'push.title',
      detail: `push.result.${Notification.permission === 'denied' ? 'denied' : 'needs-permission'}`,
    })
    return
  }
  try {
    await pushSubscriptionService.sendTestPush()
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
    <Button icon="pi pi-bell" @click="onRegister" />
    <Button :label="t('push.sendTest')" icon="pi pi-send" severity="secondary" @click="onSendTest" />
  </div>
</template>
