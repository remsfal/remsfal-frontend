<script setup lang="ts">
import { onBeforeUpdate, onMounted } from 'vue'
import { useLayout } from '@/layout/composables/layout'
import ManagerTopbar from '@/layout/ManagerTopbar.vue'
import AppFooter from '@/layout/AppFooter.vue'

const { setFullscreen } = useLayout()
onMounted(() => setFullscreen(true))
onBeforeUpdate(() => setFullscreen(true))
</script>

<template>
  <div class="layout-wrapper">
    <ManagerTopbar />
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
