<script setup lang="ts">
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
import { useProjectStore } from '@/stores/ProjectStore';
import { useRouter } from 'vue-router';
import { useUserSessionStore } from '@/stores/UserSession';
import { Status } from '@/services/TaskService';

const router = useRouter();
const projectStore = useProjectStore();
const sessionStore = useUserSessionStore();

const model = ref([
  {
    label: 'Home',
    items: [
      {
        label: 'Dashboard',
        icon: 'pi pi-fw pi-chart-bar',
        to: `/project/${projectStore.projectId}/`,
      },
      {
        label: 'Einstellungen',
        icon: 'pi pi-fw pi-cog',
        to: `/project/${projectStore.projectId}/settings`,
      },
    ],
  },
  {
    label: 'Stammdaten',
    items: [
      {
        label: 'Objektdaten',
        icon: 'pi pi-fw pi-home',
        to: `/project/${projectStore.projectId}/objects`,
      },
      {
        label: 'Mieterdaten',
        icon: 'pi pi-fw pi-users',
        to: `/project/${projectStore.projectId}/tenancies`,
      },
    ],
  },
  {
    label: 'Aufgabenmanagement',
    items: [
      {
        label: 'Meine Aufgaben',
        icon: 'pi pi-fw pi-list',
        navigate: () => {
          const projectId = projectStore.selectedProject?.id;
          router.push({
            name: 'TaskOverview',
            params: { projectId },
            query: { owner: sessionStore.user?.id },
          });
        },
      },
      {
        label: 'Offene Aufgaben',
        icon: 'pi pi-fw pi-list',
        navigate: () => {
          const projectId = projectStore.selectedProject?.id;
          router.push({
            name: 'TaskOverview',
            params: { projectId },
            query: { status: Status.OPEN },
          });
        },
      },
      {
        label: 'Alle Aufgaben',
        icon: 'pi pi-fw pi-list',
        navigate: () => {
          const projectId = projectStore.selectedProject?.id;
          router.push({ name: 'TaskOverview', params: { projectId } });
        },
      },
    ],
  },
  {
    label: 'Mängelmanagement',
    items: [
      { label: 'Neue Meldungen', icon: 'pi pi-fw pi-list', to: '/uikit/formlayout' },
      { label: 'Offene Mängel', icon: 'pi pi-fw pi-list', to: '/uikit/formlayout' },
      { label: 'Beauftragte Mängel', icon: 'pi pi-fw pi-list', to: '/uikit/formlayout' },
      { label: 'Alle Meldungen', icon: 'pi pi-fw pi-list', to: '/uikit/input' },
    ],
  },
]);
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item.label">
      <AppMenuItem :item="item" :index="i" />
    </template>
  </ul>
</template>
