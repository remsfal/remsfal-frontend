<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>
<template>
  <footer>
    <div class="layout-footer">
      <img src="@/assets/logo.png" alt="Logo" height="20" class="mr-2" />
      <RouterLink to="/legal-notice">Impressum</RouterLink> |
      <RouterLink to="/privacy">Datenschutz</RouterLink>
    </div>
  </footer>
</template>
