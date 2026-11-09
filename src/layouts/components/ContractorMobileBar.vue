<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import AppRoleMobileBar from '@/layouts/components/AppRoleMobileBar.vue'
import ContractorMenu from '@/layouts/components/ContractorMenu.vue'
import type { MobileNavItem } from '@/layouts/composables/useMobileBarActiveState'
import { useOrganizationStore } from '@/stores/OrganizationStore'

const { t } = useI18n()
const organizationStore = useOrganizationStore()
const { initialized } = storeToRefs(organizationStore)
const ordersDisabled = computed(() => initialized.value && !organizationStore.isOrganizationMember)

// The drawer renders ContractorMenu lazily, so the bar has to load the organizations itself
onMounted(() => {
  if (!initialized.value) {
    organizationStore.fetchUserOrganization()
  }
})

const navItems = computed<MobileNavItem[]>(() => [
  {
    label: t('contractorMenu.orderManagement.overview'),
    to: { name: 'ContractorDashboard' },
    icon: 'pi-home',
  },
  {
    label: t('contractorMenu.orderManagement.open'),
    icon: { type: 'pi', name: 'pi pi-fw pi-pen-to-square' },
    to: '/contractor/orders/open',
    disabled: ordersDisabled.value,
  },
  {
    label: t('contractorMenu.orderManagement.ongoing'),
    icon: { type: 'pi', name: 'pi pi-fw pi-stop' },
    to: '/contractor/orders/ongoing',
    disabled: ordersDisabled.value,
  },
])
</script>

<template>
  <AppRoleMobileBar :navItems="navItems">
    <ContractorMenu />
  </AppRoleMobileBar>
</template>
