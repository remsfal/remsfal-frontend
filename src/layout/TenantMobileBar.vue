<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import Drawer from 'primevue/drawer';
import TenantMenu from '@/layout/TenantMenu.vue';

interface MobileNavItem {
  label: string;
  to: any;
  icon: string;
}

const route = useRoute();
const sidebarVisible = ref(false);

const navItems: MobileNavItem[] = [
  {
    label: 'Überblick',
    to: '/',
    icon: 'pi-home'
  },
  {
    label: 'Meldungen',
    to: { name: 'Inbox' },
    icon: 'pi-inbox'
  }
];

function toggleSidebar() {
  sidebarVisible.value = !sidebarVisible.value;
}

function isActive(item: MobileNavItem) {
  if (!item.to) return false;
  
   // String Path matching
  if (typeof item.to === 'string') {
     return route.path === item.to || (item.to !== '/' && route.path.startsWith(item.to));
  }
  
  // Named Route matching
  if (typeof item.to === 'object' && item.to !== null && 'name' in item.to) {
      return route.name === item.to.name;
  }
  
  return false;
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
        class="pi"
        :class="item.icon"
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
       <TenantMenu />
    </Drawer>
  </div>
</template>

<style scoped>
.mobile-nav-bar {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: var(--surface-card);
  border-top: 1px solid var(--surface-border);
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--text-color-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.nav-item.active {
  color: var(--p-primary-color, #4CAF50);
  border-top: 3px solid var(--p-primary-color, #4CAF50);
}

.more-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color-secondary);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
</style>
