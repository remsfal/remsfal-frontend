<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, RouterLink, type RouteLocationRaw } from 'vue-router';
import Drawer from 'primevue/drawer';
import ContractorMenu from '@/layout/ContractorMenu.vue';

interface MobileNavItem {
  label: string;
  to: RouteLocationRaw;
  icon: string | { type: 'pi' | 'fa'; name: string | string[] };
}

const route = useRoute();
const sidebarVisible = ref(false);

const navItems = computed<MobileNavItem[]>(() => [
  {
    label: 'Übersicht',
    to: { name: 'ContractorView' }, 
    icon: 'pi-home'
  },
  {
    label: 'Aufträge',
    to: { name: 'ContractorView', query: { tab: 'orders' } },
    icon: 'pi-id-card'
  }
]);

function toggleSidebar() {
  sidebarVisible.value = !sidebarVisible.value;
}

function isActive(item: MobileNavItem) {
  if (!item.to) return false;
  
  // Special logic for Contractor query params
  if (route.name === 'ContractorView' && item.to.name === 'ContractorView') {
      const targetQuery = item.to.query || {};
      const currentQuery = route.query || {};
      
      // If we are looking for the 'orders' tab
      if (targetQuery.tab === 'orders') {
          return currentQuery.tab === 'orders';
      }
      
      // If we are looking for the 'overview' (no tab or empty tab)
      return !currentQuery.tab;
  }
  
  return false;
}

function getIconClass(item: MobileNavItem) {
    if (typeof item.icon === 'string') {
        return item.icon;
    }
    if (item.icon && item.icon.type === 'pi') {
        return item.icon.name;
    }
    return '';
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
        :class="getIconClass(item)"
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
      <ContractorMenu />
    </Drawer>
  </div>
</template>

<style scoped>
.mobile-nav-bar {
  height: 60px;
  background-color: var(--surface-card);
  border-top: 1px solid var(--surface-border);
  justify-content: space-around;
  align-items: center;
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
