<script setup lang="ts">
import { onBeforeUpdate, onMounted } from 'vue'
import { useLayout } from '@/layouts/composables/layout'
import AppFooter from '@/layouts/components/AppFooter.vue'
import AppSimpleTopbar from '@/layouts/components/AppSimpleTopbar.vue'

const { setFullscreen } = useLayout()
onMounted(() => setFullscreen(true))
onBeforeUpdate(() => setFullscreen(true))
</script>

<template>
  <div class="layout-wrapper">
    <AppSimpleTopbar />
    <div class="layout-main-container">
      <main>
        <div class="layout-main">
          <div class="flex flex-col gap-8">
            <slot />
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  </div>
</template>
