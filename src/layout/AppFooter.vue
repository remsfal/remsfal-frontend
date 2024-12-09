<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>
<template>
  <footer>
    <div class="layout-footer">
      <img src="@/assets/logo.png" alt="Logo" height="20" class="mr-2" />
      <RouterLink to="/legal-notice">{{ $t('legalNotice.title') }}</RouterLink>
      |
      <RouterLink to="/privacy">{{ $t('privacy.title') }}</RouterLink>
    </div>
  </footer>
</template>
