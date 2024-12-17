<script setup lang="ts">
import BaseLayout from './BaseLayout.vue';
import AppTopbar from './AppTopbar.vue';
import AppFooter from './AppFooter.vue';
import ConsultantMenu from './ConsultantMenu.vue';
</script>

<template>
  <BaseLayout>
    <template #topbar>
      <AppTopbar />
    </template>
    <template #sidebar>
      <ConsultantMenu />
    </template>
    <template #footer>
      <AppFooter />
    </template>
  </BaseLayout>
</template>
