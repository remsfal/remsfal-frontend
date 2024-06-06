AppMenu.vue<script setup lang="ts">
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', to: '/' },
            { label: 'Einstellungen', icon: 'pi pi-fw pi-cog', to: '/' },
        ]
    },
    {
        label: 'Stammdaten',
        items: [
            { label: 'Objektdaten', icon: 'pi pi-fw pi-home', to: '/uikit/formlayout' },
            { label: 'Mieter', icon: 'pi pi-fw pi-users', to: '/uikit/input' }
        ]
    },
    {
        label: 'Aufgabenmanagement',
        items: [
          { label: 'Meine Aufgaben', icon: 'pi pi-fw pi-list', to: '/uikit/formlayout' },
          { label: 'Offene Aufgaben', icon: 'pi pi-fw pi-list', to: '/uikit/formlayout' },
          { label: 'Alle Aufgaben', icon: 'pi pi-fw pi-list', to: '/uikit/input' }
        ]
    },
    {
        label: 'Mängelmanagement',
        items: [
          { label: 'Neue Meldungen', icon: 'pi pi-fw pi-list', to: '/uikit/formlayout' },
          { label: 'Offene Mängel', icon: 'pi pi-fw pi-list', to: '/uikit/formlayout' },
          { label: 'Beauftragte Mängel', icon: 'pi pi-fw pi-list', to: '/uikit/formlayout' },
          { label: 'Alle Meldungen', icon: 'pi pi-fw pi-list', to: '/uikit/input' }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item :item="item" :index="i"></app-menu-item>
        </template>
    </ul>
</template>
