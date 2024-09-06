<script setup lang="ts">
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
  {
    label: 'Mietverhältnis',
    items: [
      { label: 'Überblick', icon: 'pi pi-fw pi-home', to: '/' },
      { label: 'Meldungen', icon: 'pi pi-fw pi-comment', to: '/uikit/formlayout' },
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
