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
        to: '/contractor',
      },
      {
        label: 'consultantMenu.home.client',
        icon: { type: 'pi', name: 'pi pi-fw pi-id-card' },
        to: '/contractor',
      },
    ],
  },
  {
    label: 'consultantMenu.clientManagement',
    items: [
      {
        label: 'consultantMenu.clientManagement.open',
        icon: { type: 'pi', name: 'pi pi-fw pi-id-card' },
        to: '/contractor',
      },
      {
        label: 'consultantMenu.clientManagement.ongoing',
        icon: { type: 'pi', name: 'pi pi-fw pi-check-square' },
        to: '/contractor',
      },
      {
        label: 'consultantMenu.clientManagement.closed',
        icon: { type: 'pi', name: 'pi pi-fw pi-bookmark' },
        to: '/contractor',
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
