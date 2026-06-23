<script setup lang="ts">
import AppRoleMobileBar from '@/layouts/components/AppRoleMobileBar.vue'
import ManagerMenu from '@/layouts/components/ManagerMenu.vue'
import type { MobileNavItem } from '@/layouts/composables/useMobileBarActiveState'

const navItems: MobileNavItem[] = [
  {
    label: 'Projekte',
    to: { name: 'ProjectSelection' },
    icon: 'pi-briefcase',
  },
  {
    label: 'Einstellungen',
    to: { name: 'ManagerAccountSettings' },
    icon: 'pi-cog',
  },
]
</script>

<template>
  <AppRoleMobileBar :navItems="navItems">
    <ManagerMenu />
  </AppRoleMobileBar>
</template>
