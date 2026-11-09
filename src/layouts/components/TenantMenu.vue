<script setup lang="ts">
import { computed } from 'vue';

import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';
import { useUserSessionStore } from '@/stores/UserSession';

const sessionStore = useUserSessionStore();

const model = computed<MenuItem[]>(() => [
  {
    label: 'tenantMenu.tenancies',
    items: [
      {
        label: 'tenantMenu.tenancies.overview',
        icon: { type: 'pi', name: 'pi pi-fw pi-info-circle' },
        to: '/tenant/dashboard',
      },
      {
        label: 'tenantMenu.tenancies.reports',
        icon: { type: 'pi', name: 'pi pi-fw pi-list' },
        to: '/tenant/issues',
      },
    ],
  },
  {
    label: 'tenantMenu.settings',
    items: [
      {
        label: 'tenantMenu.settings.personalData',
        icon: { type: 'pi', name: 'pi pi-fw pi-user' },
        to: '/tenant/account-data',
      },
    ],
  },
  {
    label: 'tenantMenu.furtherServices',
    items: [
      {
        label: 'tenantMenu.furtherServices.properties',
        icon: { type: 'pi', name: 'pi pi-fw pi-home' },
        to: '/tenant/properties',
      },
      {
        label: 'tenantMenu.furtherServices.organizations',
        icon: { type: 'pi', name: 'pi pi-fw pi-wrench' },
        to: '/tenant/organizations',
      },
      {
        label: 'tenantMenu.furtherServices.orderManagement',
        icon: { type: 'pi', name: 'pi pi-fw pi-briefcase' },
        to: '/contractor/dashboard',
        visible: sessionStore.isContractor,
      },
    ],
  },
]);
</script>

<template>
  <div class="layout-sidebar">
    <ul class="layout-menu">
      <template v-for="(item, i) in model" :key="item.label">
        <AppMenuItem :item="item" :index="i" />
      </template>
    </ul>
  </div>
</template>
