<script setup lang="ts">
import AppRoleMobileBar from '@/layouts/components/AppRoleMobileBar.vue'
import ContractorMenu from '@/layouts/components/ContractorMenu.vue'
import type { MobileNavItem } from '@/layouts/composables/useMobileBarActiveState'

const navItems: MobileNavItem[] = [
  {
    label: 'Übersicht',
    to: { name: 'ContractorDashboard' },
    icon: 'pi-home',
  },
  {
    label: 'Auftraggeber',
    to: { name: 'ContractorView' },
    icon: 'pi-id-card',
  },
]
</script>

<template>
  <AppRoleMobileBar :navItems="navItems">
    <ContractorMenu />
  </AppRoleMobileBar>
</template>
