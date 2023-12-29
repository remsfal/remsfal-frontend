<script setup lang="ts">
import Footer from "@/components/FooterMenu.vue";
</script>

<template>
  <main>
    <div class="base-layout-space">
      <div class="grid">
        <slot />
      </div>
    </div>
  </main>
  <Footer />
</template>
