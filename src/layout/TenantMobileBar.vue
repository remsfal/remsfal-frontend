<script setup lang="ts">
import { RouterLink } from 'vue-router';
import Drawer from 'primevue/drawer';
import TenantMenu from '@/layout/TenantMenu.vue';
import { useMobileBarActiveState, type MobileNavItem } from '@/layout/composables/useMobileBarActiveState';

const { isActive, sidebarVisible, toggleSidebar } = useMobileBarActiveState();

const navItems: MobileNavItem[] = [
  {
    label: 'Überblick',
    to: { name: 'TenantDashboard' },
    icon: 'pi-home'
  },
  {
    label: 'Meldungen',
    to: { name: 'TenantIssues' },
    icon: 'pi-list'
  }
];
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
