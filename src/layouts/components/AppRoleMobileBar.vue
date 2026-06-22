<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Drawer from 'primevue/drawer'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useMobileBarActiveState, type MobileNavItem } from '@/layouts/composables/useMobileBarActiveState'

interface Props {
  navItems: MobileNavItem[]
  isActiveFn?: (item: MobileNavItem) => boolean
}
const props = defineProps<Props>()
const { isActive: defaultIsActive, sidebarVisible, toggleSidebar } = useMobileBarActiveState()
const isActive = (item: MobileNavItem) => props.isActiveFn ? props.isActiveFn(item) : defaultIsActive(item)

function getIconClass(item: MobileNavItem): string {
  if (typeof item.icon === 'string') return item.icon
  if (item.icon?.type === 'pi') return item.icon.name as string
  return ''
}
</script>

<template>
  <div class="mobile-nav-bar">
    <RouterLink
      v-for="item in navItems"
      :key="item.label"
      :to="item.to"
      class="nav-item"
      :class="{ active: isActive(item) }"
    >
      <i
        v-if="typeof item.icon === 'string' || item.icon?.type === 'pi'"
        class="pi"
        :class="getIconClass(item)"
        style="font-size: 1.2rem;"
      />
      <FontAwesomeIcon
        v-else-if="item.icon?.type === 'fa'"
        :icon="item.icon.name"
        style="font-size: 1.2rem;"
      />
      <span class="sr-only">{{ item.label }}</span>
    </RouterLink>

    <button type="button" class="nav-item more-btn" @click="toggleSidebar">
      <i class="pi pi-ellipsis-h" style="font-size: 1.2rem;" />
    </button>

    <Drawer
      v-model:visible="sidebarVisible"
      position="right"
      class="mobile-sidebar-drawer"
      style="width: 80vw; max-width: 300px;"
    >
      <slot />
    </Drawer>
  </div>
</template>
