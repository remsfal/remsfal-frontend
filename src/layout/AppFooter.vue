<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <footer>
    <div class="layout-footer">
      <img
        src="@/assets/logo.png"
        alt="Logo"
        class="mr-2"
      >
      <RouterLink to="/legal-notice">
        {{ t('legalNotice.title') }}
      </RouterLink>
      |
      <RouterLink to="/privacy">
        {{ t('privacy.title') }}
      </RouterLink>
    </div>
  </footer>
</template>
