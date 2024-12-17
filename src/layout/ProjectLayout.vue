<script setup lang="ts">
import BaseLayout from './BaseLayout.vue';
import AppTopbar from './AppTopbar.vue';
import AppFooter from './AppFooter.vue';
import AppSidebar from './AppSidebar.vue';
</script>

<template>
  <BaseLayout>
    <template #topbar>
      <AppTopbar />
    </template>
    <template #sidebar>
      <AppSidebar />
    </template>
    <template #footer>
      <AppFooter />
    </template>
  </BaseLayout>
</template>
