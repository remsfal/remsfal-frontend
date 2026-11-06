<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppRoleMobileBar from '@/layouts/components/AppRoleMobileBar.vue'
import TenantMenu from '@/layouts/components/TenantMenu.vue'
import type { MobileNavItem } from '@/layouts/composables/useMobileBarActiveState'

const { t } = useI18n()

const navItems = computed<MobileNavItem[]>(() => [
  {
    label: t('tenantMenu.tenancies.overview'),
    to: { name: 'TenantDashboard' },
    icon: 'pi-home',
  },
  {
    label: t('tenantMenu.tenancies.reports'),
    to: { name: 'TenantIssues' },
    icon: 'pi-list',
  },
])
</script>

<template>
  <AppRoleMobileBar :navItems="navItems">
    <TenantMenu />
  </AppRoleMobileBar>
</template>
