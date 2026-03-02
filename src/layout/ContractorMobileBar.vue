<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import Drawer from 'primevue/drawer';
import ContractorMenu from '@/layout/ContractorMenu.vue';
import { useMobileBarActiveState, type MobileNavItem } from '@/layout/composables/useMobileBarActiveState';

const { isActive } = useMobileBarActiveState();
const sidebarVisible = ref(false);

const navItems: MobileNavItem[] = [
  {
    label: 'Übersicht',
    to: { name: 'ContractorDashboard' },
    icon: 'pi-home'
  },
  {
    label: 'Auftraggeber',
    to: { name: 'ContractorView' },
    icon: 'pi-id-card'
  }
];

function toggleSidebar() {
  sidebarVisible.value = !sidebarVisible.value;
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
        :class="typeof item.icon === 'string' ? item.icon : ''"
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
