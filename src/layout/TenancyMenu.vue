<script setup lang="ts">
import { ref } from 'vue';

import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';

const model = ref([
  {
    label: 'MÄNGELMANAGEMENT',
    items: [
      {
        label: 'Neue Meldungen',
        icon: { type: 'pi', name: 'pi pi-fw pi-home' },
        to: '/tenancy',
      },
      {
        label: 'Offene Mängel',
        icon: { type: 'pi', name: 'pi pi-fw pi-comment' },
        to: '/uikit/formlayout',
      },
      {
        label: 'Abgeschlossene Mängel',
        icon: { type: 'pi', name: 'pi pi-fw pi-list' },
        to: '/tenancy'
      },
      {
        label: 'Alle Mängel',
        icon: { type: 'pi', name: 'pi pi-fw pi-list' },
        to: '/tenancy'
      }
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
