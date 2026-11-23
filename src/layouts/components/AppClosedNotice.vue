<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAppMode } from '@/helper/appMode'

const { t } = useI18n()

const message = computed(() =>
  getAppMode() === 'MAINTENANCE' ? t('appMode.maintenance.message') : t('appMode.construction.message'),
)
</script>

<template>
  <div class="flex flex-col items-center text-center gap-6" data-test="app-closed-notice">
    <img src="@/assets/remsfal-logo.svg" alt="REMSFAL" class="w-80 max-w-[80vw]">
    <p class="text-lg text-muted-color max-w-xl m-0">
      {{ message }}
    </p>
  </div>
</template>
