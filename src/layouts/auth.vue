<script setup lang="ts">
// Minimal layout for authentication pages: no topbar, no sidebar, no footer.
// The dark mode set on the other pages (`app-dark` on <html>) is simply inherited.
</script>

<template>
  <div
    class="auth-layout min-h-screen flex items-center justify-center overflow-hidden
      px-4 py-8 bg-surface-50 dark:bg-surface-950"
  >
    <slot />
  </div>
</template>
