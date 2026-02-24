<script setup lang="ts">
import { ref } from 'vue';
import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';

const model = ref([
  {
    label: 'managerMenu.myData',
    items: [
      {
        label: 'managerMenu.myData.overview',
        icon: { type: 'pi', name: 'pi pi-fw pi-chart-bar' },
        to: '/manager/dashboard',
      },
      {
        label: 'managerMenu.myData.properties',
        icon: { type: 'pi', name: 'pi pi-fw pi-building' },
        to: '/manager/projects',
      },
      {
        label: 'managerMenu.myData.personalData',
        icon: { type: 'pi', name: 'pi pi-fw pi-user' },
        to: '/manager/account-settings',
      },
      {
        label: 'managerMenu.myData.settings',
        icon: { type: 'pi', name: 'pi pi-fw pi-cog' },
        to: '/manager/dashboard',
      },
    ],
  },
  {
    label: 'managerMenu.organizations',
    items: [
      {
        label: 'managerMenu.organizations.create',
        icon: { type: 'pi', name: 'pi pi-fw pi-user-plus' },
        to: '/manager/dashboard',
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
