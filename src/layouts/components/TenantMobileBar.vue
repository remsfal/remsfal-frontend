<script setup lang="ts">
import AppRoleMobileBar from '@/layouts/components/AppRoleMobileBar.vue'
import TenantMenu from '@/layouts/components/TenantMenu.vue'
import type { MobileNavItem } from '@/layouts/composables/useMobileBarActiveState'

const navItems: MobileNavItem[] = [
  {
    label: 'Überblick',
    to: { name: 'TenantDashboard' },
    icon: 'pi-home',
  },
  {
    label: 'Meldungen',
    to: { name: 'TenantIssues' },
    icon: 'pi-list',
  },
]
</script>

<template>
  <AppRoleMobileBar :navItems="navItems">
    <TenantMenu />
  </AppRoleMobileBar>
</template>
