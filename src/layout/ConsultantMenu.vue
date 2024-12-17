<script setup lang="ts">
import { ref } from 'vue';

import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';

const model = ref([
  {
    label: 'Home',
    items: [
      { label: 'Überblick', icon: {type: 'pi', name: 'pi pi-fw pi-home'}, to: '/contractor' },
      { label: 'Auftraggeber', icon: {type: 'pi', name: 'pi pi-fw pi-id-card'}, to: '/contractor' },
    ],
  },
  {
    label: 'Auftragsmanagement',
    items: [
      {
        label: 'Offene Anfragen',
        icon: { type: 'pi', name: 'pi pi-fw pi-id-card' },
        to: '/contractor',
      },
      {
        label: 'Laufende Aufträge',
        icon: { type: 'pi', name: 'pi pi-fw pi-check-square' },
        to: '/contractor',
      },
      {
        label: 'Abgeschlossene Aufträge',
        icon: { type: 'pi', name: 'pi pi-fw pi-bookmark' },
        to: '/contractor',
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
