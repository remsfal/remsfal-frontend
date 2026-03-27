<script setup lang="ts">
import { ref } from 'vue';

import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';

const model = ref([
  {
    label: 'consultantMenu.home',
    items: [
      {
        label: 'consultantMenu.home.overview',
        icon: { type: 'pi', name: 'pi pi-fw pi-home' },
        to: '/contractor/dashboard',
      },
      {
        label: 'consultantMenu.home.client',
        icon: { type: 'pi', name: 'pi pi-fw pi-id-card' },
        to: '/contractor/issues',
      },
    ],
  },
  {
    label: 'consultantMenu.clientManagement',
    items: [
      {
        label: 'consultantMenu.clientManagement.open',
        icon: { type: 'pi', name: 'pi pi-fw pi-id-card' },
        to: '/contractor/clients/open',
      },
      {
        label: 'consultantMenu.clientManagement.ongoing',
        icon: { type: 'pi', name: 'pi pi-fw pi-check-square' },
        to: '/contractor/clients/ongoing',
      },
      {
        label: 'consultantMenu.clientManagement.closed',
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
