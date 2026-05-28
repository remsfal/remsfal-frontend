<script setup lang="ts">
import { ref } from 'vue';

import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';

const model = ref([
  {
    label: 'tenantMenu.tenancies',
    items: [
      {
        label: 'tenantMenu.tenancies.overview',
        icon: { type: 'pi', name: 'pi pi-fw pi-info-circle' },
        to: '/tenancies/dashboard',
      },
      {
        label: 'tenantMenu.tenancies.reports',
        icon: { type: 'pi', name: 'pi pi-fw pi-list' },
        to: '/tenancies/issues',
      },
    ],
  },
  {
    label: 'tenantMenu.settings',
    items: [
      {
        label: 'tenantMenu.settings.personalData',
        icon: { type: 'pi', name: 'pi pi-fw pi-user' },
        to: '/tenancies/account-settings',
      },
    ],
  },
  {
    label: 'tenantMenu.furtherServices',
    items: [
      {
        label: 'tenantMenu.furtherServices.properties',
        icon: { type: 'pi', name: 'pi pi-fw pi-home' },
        to: '/manager/projects',
      },
      {
        label: 'tenantMenu.furtherServices.orders',
        icon: { type: 'pi', name: 'pi pi-fw pi-wrench' },
        to: '/contractor/dashboard',
      },
    ],
  },
] as MenuItem[]);
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
