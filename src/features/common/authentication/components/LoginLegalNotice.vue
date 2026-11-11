<script setup lang="ts">
// Legal notice below the sign-in options of the login page. Kept as a separate component so that
// downstream projects can replace it via src/extensions/overrides/ (e.g. to link their own terms
// of use and privacy policy) without overriding the whole LoginView.
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
