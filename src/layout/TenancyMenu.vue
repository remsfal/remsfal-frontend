<script setup lang="ts">
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Mietverhältnis',
        items: [
            { label: 'Überblick', icon: 'pi pi-fw pi-home', to: '/' }
            { label: 'Meldungen', icon: 'pi pi-fw pi-comment', to: '/uikit/formlayout' }
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
