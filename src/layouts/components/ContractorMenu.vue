<script setup lang="ts">
import { ref } from 'vue';

import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';

const model = ref([
  {
    label: 'contractorMenu.myData',
    items: [
      {
        label: 'contractorMenu.myData.overview',
        icon: { type: 'pi', name: 'pi pi-fw pi-home' },
        to: '/contractor/dashboard',
      },
      {
        label: 'contractorMenu.myData.client',
        icon: { type: 'pi', name: 'pi pi-fw pi-id-card' },
        to: '/contractor/issues',
      },
      {
        label: 'contractorMenu.myData.personalData',
        icon: { type: 'pi', name: 'pi pi-fw pi-user' },
        to: '/contractor/account-settings',
      },
      {
        label: 'contractorMenu.myData.settings',
        icon: { type: 'pi', name: 'pi pi-fw pi-cog' },
        to: '/contractor/settings',
      },
    ],
  },
  {
    label: 'contractorMenu.clientManagement',
    items: [
      {
        label: 'contractorMenu.clientManagement.open',
        icon: { type: 'pi', name: 'pi pi-fw pi-id-card' },
        to: '/contractor/clients/open',
      },
      {
        label: 'contractorMenu.clientManagement.ongoing',
        icon: { type: 'pi', name: 'pi pi-fw pi-check-square' },
        to: '/contractor/clients/ongoing',
      },
      {
        label: 'contractorMenu.clientManagement.closed',
        icon: { type: 'pi', name: 'pi pi-fw pi-bookmark' },
        to: '/contractor/clients/closed',
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
