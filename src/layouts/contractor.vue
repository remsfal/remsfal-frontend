<script setup lang="ts">
import { watch, ref, onBeforeUpdate, onMounted, computed } from 'vue'
import { useLayout } from '@/layouts/composables/layout'
import AppSimpleTopbar from '@/layouts/components/AppSimpleTopbar.vue'
import ContractorMenu from '@/layouts/components/ContractorMenu.vue'
import ContractorMobileBar from '@/layouts/components/ContractorMobileBar.vue'
import AppFooter from '@/layouts/components/AppFooter.vue'

const { layoutConfig, layoutState, isSidebarActive, setFullscreen } = useLayout()

onMounted(() => setFullscreen(false))
onBeforeUpdate(() => setFullscreen(false))

const containerClass = computed(() => ({
  'layout-overlay': layoutConfig.menuMode === 'overlay',
  'layout-static': layoutConfig.menuMode === 'static',
  'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
  'layout-overlay-active': layoutState.overlayMenuActive,
}))

const outsideClickListener = ref<((event: Event) => void) | null>(null)
watch(isSidebarActive, (newVal) => {
  if (newVal) bindOutsideClickListener()
  else unbindOutsideClickListener()
})

function bindOutsideClickListener() {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event: Event) => {
      if (isOutsideClicked(event)) {
        layoutState.overlayMenuActive = false
        layoutState.menuHoverActive = false
      }
    }
    document.addEventListener('click', outsideClickListener.value)
  }
}
function unbindOutsideClickListener() {
  if (outsideClickListener.value) {
    document.removeEventListener('click', outsideClickListener.value)
    outsideClickListener.value = null
  }
}
function isOutsideClicked(event: Event) {
  const sidebarEl = document.querySelector('.layout-sidebar')
  const topbarEl = document.querySelector('.layout-menu-button')
  return !(
    sidebarEl!.isSameNode(event.target as Node) ||
    sidebarEl!.contains(event.target as Node) ||
    topbarEl!.isSameNode(event.target as Node) ||
    topbarEl!.contains(event.target as Node)
  )
}
</script>

<template>
  <div class="layout-wrapper" :class="containerClass">
    <AppSimpleTopbar />
    <div class="layout-sidebar-wrapper">
      <ContractorMenu />
    </div>
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
    <ContractorMobileBar class="layout-mobile-navbar" />
  </div>
</template>
