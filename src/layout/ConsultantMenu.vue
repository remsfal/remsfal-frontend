<script setup lang="ts">
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
  {
    label: 'Home',
    items: [
      { label: 'Überblick', icon: 'pi pi-fw pi-home', to: '/' },
      { label: 'Auftraggeber', icon: 'pi pi-fw pi-id-card', to: '/fullscreen' },
    ],
  },
  {
    label: 'Auftragsmanagement',
    items: [
      { label: 'Offene Anfragen', icon: 'pi pi-fw pi-id-card', to: '/uikit/formlayout' },
      { label: 'Laufende Aufträge', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' },
      { label: 'Abgeschlossene Aufträge', icon: 'pi pi-fw pi-bookmark', to: '/uikit/floatlabel' },
    ],
  },
]);
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <AppMenuItem :item="item" :index="i"></AppMenuItem>
    </template>
  </ul>
</template>
