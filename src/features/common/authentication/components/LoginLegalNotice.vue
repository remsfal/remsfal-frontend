<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <p
    data-test="login-legal-notice"
    class="text-xs text-surface-500 dark:text-surface-400 text-center leading-relaxed"
  >
    {{ t('login.description') }}
  </p>
</template>
