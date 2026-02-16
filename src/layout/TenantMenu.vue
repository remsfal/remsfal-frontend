<script setup lang="ts">
import { ref } from 'vue';

import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';

const model = ref([
  {
    label: 'Mietverhältnisse',
    items: [
      {
        label: 'Überblick',
        icon: { type: 'pi', name: 'pi pi-fw pi-info-circle' },
        to: '/tenancies/dashboard',
      },
      {
        label: 'Meldungen',
        icon: { type: 'pi', name: 'pi pi-fw pi-list' },
        to: '/tenancies/issues',
      },
    ],
  },
  {
    label: 'Einstellungen',
    items: [
      {
        label: 'Persönliche Daten',
        icon: { type: 'pi', name: 'pi pi-fw pi-user' },
        to: '/account-settings',
      },
    ],
  },
  {
    label: 'Weitere Leistungen',
    items: [
      {
        label: 'Meine Immobilien',
        icon: { type: 'pi', name: 'pi pi-fw pi-home' },
        to: '/projects',
      },
      {
        label: 'Meine Aufträge',
        icon: { type: 'pi', name: 'pi pi-fw pi-wrench' },
        to: '/contractor/dashboard',
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
