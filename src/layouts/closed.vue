<script setup lang="ts">
// Layout while the app is closed (CONSTRUCTION/MAINTENANCE mode): no topbar, no menu —
// only the page content and the footer, so the legal texts linked there stay reachable.
import AppFooter from '@/layouts/components/AppFooter.vue'
</script>

<template>
  <div class="closed-layout min-h-screen flex flex-col px-8">
    <main class="flex-1 flex flex-col justify-center py-8">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
