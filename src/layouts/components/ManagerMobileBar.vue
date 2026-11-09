<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppRoleMobileBar from '@/layouts/components/AppRoleMobileBar.vue'
import ManagerMenu from '@/layouts/components/ManagerMenu.vue'
import type { MobileNavItem } from '@/layouts/composables/useMobileBarActiveState'

const { t } = useI18n()

const navItems = computed<MobileNavItem[]>(() => [
  {
    label: t('managerMenu.propertyManagement.overview'),
    to: { name: 'ManagerDashboard' },
    icon: 'pi-chart-bar',
  },
  {
    label: t('managerMenu.propertyManagement.activityFeeds'),
    to: { name: 'ActivityFeeds' },
    icon: 'pi-bell',
  },
  {
    label: t('managerMenu.propertyManagement.properties'),
    to: { name: 'ProjectSelection' },
    icon: 'pi-building',
  },
  {
    label: t('managerMenu.propertyManagement.contractors'),
    to: { name: 'ManagerContractorList' },
    icon: 'pi-id-card',
  },
])
</script>

<template>
  <AppRoleMobileBar :navItems="navItems">
    <ManagerMenu />
  </AppRoleMobileBar>
</template>
