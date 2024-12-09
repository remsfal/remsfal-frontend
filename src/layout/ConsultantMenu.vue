<script setup lang="ts">
import { ref } from 'vue';

import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';

const model = ref([
  // TODO: Replace with translations menu items
  {
    label: 'consultantMenu.home',
    items: [
      { label: 'consultantMenu.home.overview', icon: 'pi pi-fw pi-home', to: '/' },
      { label: 'consultantMenu.home.client', icon: 'pi pi-fw pi-id-card', to: '/fullscreen' },
    ],
  },
  {
    label: 'consultantMenu.clientManagement',
    items: [
      {
        label: 'consultantMenu.clientManagement.open',
        icon: 'pi pi-fw pi-id-card',
        to: '/uikit/formlayout',
      },
      {
        label: 'consultantMenu.clientManagement.ongoing',
        icon: 'pi pi-fw pi-check-square',
        to: '/uikit/input',
      },
      {
        label: 'consultantMenu.clientManagement.closed',
        icon: 'pi pi-fw pi-bookmark',
        to: '/uikit/floatlabel',
      },
    ],
  },
] as MenuItem[]);
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <AppMenuItem :item="item" :index="i"></AppMenuItem>
    </template>
  </ul>
</template>
