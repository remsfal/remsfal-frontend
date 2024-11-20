<script setup lang="ts">
import { ref } from 'vue';

import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';

const model = ref([
  {
    label: 'Home',
    items: [
      { label: 'Überblick', icon: {type: 'pi', name: 'pi pi-fw pi-home'}, to: '/' },
      { label: 'Auftraggeber', icon: {type: 'pi', name: 'pi pi-fw pi-id-card'}, to: '/fullscreen' },
    ],
  },
  {
    label: 'Auftragsmanagement',
    items: [
      { label: 'Offene Anfragen', icon: {type: 'pi', name: 'pi pi-fw pi-id-card'}, to: '/uikit/formlayout' },
      { label: 'Laufende Aufträge', icon: {type: 'pi', name: 'pi pi-fw pi-check-square'}, to: '/uikit/input' },
      { label: 'Abgeschlossene Aufträge', icon: {type: 'pi', name: 'pi pi-fw pi-bookmark'}, to: '/uikit/floatlabel' },
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
