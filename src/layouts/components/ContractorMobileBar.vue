<script setup lang="ts">
import AppRoleMobileBar from '@/layouts/components/AppRoleMobileBar.vue'
import ContractorMenu from '@/layouts/components/ContractorMenu.vue'
import type { MobileNavItem } from '@/layouts/composables/useMobileBarActiveState'

const navItems: MobileNavItem[] = [
  {
    label: 'contractorMenu.orderManagement.overview',
    to: { name: 'ContractorDashboard' },
    icon: 'pi-home',
  },
  {
    label: 'contractorMenu.orderManagement.open',
    icon: { type: 'pi', name: 'pi pi-fw pi-id-card' },
    to: '/contractor/orders/open',
  },
  {
    label: 'contractorMenu.orderManagement.ongoing',
    icon: { type: 'pi', name: 'pi pi-fw pi-check-square' },
    to: '/contractor/orders/ongoing',
  },
]
</script>

<template>
  <AppRoleMobileBar :navItems="navItems">
    <ContractorMenu />
  </AppRoleMobileBar>
</template>
